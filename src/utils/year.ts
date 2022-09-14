import { prisma } from '@/server/db/client'
import { makeDateId } from '@/server/db/models/date'
import { createMonthRange } from '@/server/db/models/month/create'
import { compareAsc } from 'date-fns'
import { createDateRange } from './create-dates'
import fetchHolidays from './fetch-holidays'

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

export const yearUpsertHandler = async (year: number) => {
  const holidaysApi = await fetchHolidays({
    year,
  })

  let action: 'updated' | 'read' = 'read'
  const yearData = await prisma.year.findUnique({
    where: {
      id: year,
    },
  })

  if (!yearData) {
    action = 'updated'
    const months = await createMonthRange(year, ({ index }) => {
      return {
        dates: {
          create: createDateRange(year, index),
        },
      }
    })

    await prisma.year.create({
      data: {
        id: year,
        months: {
          create: months,
        },
      },
      include: yearArgs.include,
    })
  }

  const compared = yearData
    ? compareAsc(yearData.updatedAt, new Date(holidaysApi.updated))
    : -1

  if (compared < 0) {
    action = 'updated'

    const listOfMarks = holidaysApi.items.map((holiday) => {
      const date = new Date(holiday.start.date)
      const dateId = makeDateId(date)
      return {
        id: holiday.id,
        dateId: dateId,
        year: date.getFullYear(),
        type: holiday.eventType,
        summary: holiday.summary,
        description: holiday.description,
      }
    })

    await prisma.group.upsert({
      where: {
        name: holidaysApi.summary,
      },
      update: {
        marks: {
          deleteMany: listOfMarks.map(({ id }) => ({ id })),
          create: listOfMarks,
        },
      },
      create: {
        name: holidaysApi.summary,
        marks: {
          create: listOfMarks,
        },
      },
    })
  }

  const data = await prisma.year.findUnique({
    where: {
      id: year,
    },
    include: yearArgs.include,
  })

  return {
    action,
    data,
    compared,
  }
}
