import { prisma } from '@/server/db/client'
import { makeDateId } from '@/server/db/models/date'
import {
  createMonthWithoutYearInput,
  makeMonthId,
} from '@/server/db/models/month/create'
import { compareAsc } from 'date-fns'
import { createDateRange } from './create-dates'
import { getMonthName, MonthIndex } from './datetime'
import fetchHolidays, { holidaysReducer } from './fetch-holidays'
import { holidaysObjConverter } from './holiday'

export const yearArgs = {
  include: {
    months: {
      include: {
        dates: {
          include: {
            marks: true,
          },
        },
      },
    },
  },
}

export const monthUpsertHandler = async (year: number, month: MonthIndex) => {
  const holidaysApi = await fetchHolidays({
    year,
  })

  const holidaysObj = holidaysObjConverter(holidaysApi.items, holidaysReducer)

  let action: 'updated' | 'read' = 'read'
  let data = await prisma.month.findUnique({
    where: {
      id: makeMonthId(year, month),
    },
    include: yearArgs.include.months.include,
  })

  if (!data) {
    action = 'updated'
    const monthData = createMonthWithoutYearInput(
      year,
      {
        index: month,
        name: getMonthName(month),
      },
      {
        dates: {
          create: createDateRange(year, month, holidaysObj[month]),
        },
      }
    )

    data = await prisma.month.create({
      data: {
        ...monthData,
        year: {
          connectOrCreate: {
            where: {
              id: year,
            },
            create: {
              id: year,
            },
          },
        },
      },
      include: yearArgs.include.months.include,
    })
  }

  const compared = data
    ? compareAsc(data.updatedAt, new Date(holidaysApi.updated))
    : -1

  if (compared < 0) {
    action = 'updated'
    const holidayMonth = holidaysApi.items
      .filter((holiday) => {
        return new Date(holiday.start.date).getMonth() === month
      })
      .map((holiday) => {
        const date = new Date(holiday.start.date)
        return {
          id: holiday.id,
          type: holiday.eventType,
          summary: holiday.summary,
          description: holiday.description,
          dateId: makeDateId(date),
          year: date.getFullYear(),
        }
      })

    await prisma.group.upsert({
      where: {
        name: holidaysApi.summary,
      },
      update: {
        marks: {
          deleteMany: holidayMonth.map(({ id }) => ({ id })),
          create: holidayMonth,
        },
      },
      create: {
        name: holidaysApi.summary,
        marks: {
          create: holidayMonth,
        },
      },
    })

    data = await prisma.month.findUnique({
      where: {
        id: makeMonthId(year, month),
      },
      include: yearArgs.include.months.include,
    })
  }

  return {
    action,
    data,
  }
}
