import { prisma } from '@/server/db/client'
import { createMonthRange } from '@/server/db/models/month/create'
import { compareAsc } from 'date-fns'
import { createDateRange } from './create-dates'
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

export const yearUpsertHandler = async (year: number) => {
  const holidaysApi = await fetchHolidays({
    year,
  })

  let action: 'updated' | 'read' = 'read'
  let data = await prisma.year.findUnique({
    where: {
      id: year,
    },
    include: yearArgs.include,
  })

  const compared = data
    ? compareAsc(data.updatedAt, new Date(holidaysApi.updated))
    : -1

  if (compared < 0) {
    action = 'updated'
    const holidaysObj = holidaysObjConverter(holidaysApi.items, holidaysReducer)
    const months = await createMonthRange(year, ({ index }) => {
      return {
        dates: {
          create: createDateRange(year, index, holidaysObj[index]),
        },
      }
    })

    const updatedData = {
      id: year,
      months: {
        create: months,
      },
    }

    data = await prisma.year.upsert({
      where: {
        id: year,
      },
      update: updatedData,
      create: updatedData,
      include: yearArgs.include,
    })
  }

  return {
    action,
    data,
    holidays: holidaysObjConverter(holidaysApi.items, holidaysReducer),
  }
}
