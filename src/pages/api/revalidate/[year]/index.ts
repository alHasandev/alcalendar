import { NextApiHandler } from 'next'

import { prisma } from '@/server/db/client'
import {
  getYearlyMonths,
  holidaysObjConverter,
  objToMap,
} from '@/utils/get-months2'
import { compareAsc, formatRFC3339 } from 'date-fns'
import fetchHolidays, {
  googleHolidaysReducer,
} from '@/utils/fetch-google-holidays'

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

const yearUpsertHandler = async (year: number) => {
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
    ? compareAsc(new Date(data.updated), new Date(holidaysApi.updated))
    : -1

  if (compared < 0) {
    action = 'updated'
    const holidaysMap = holidaysObjConverter(
      holidaysApi.items,
      googleHolidaysReducer
    )
    const months = await getYearlyMonths(year, objToMap(holidaysMap))

    const updatedData = {
      id: year,
      updated: formatRFC3339(new Date()),
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
  }
}

const handler: NextApiHandler = async (req, res) => {
  try {
    const year = Number(req.query.year)

    if (isNaN(year))
      throw new TypeError('Year query not valid (YYYY) of numeric!')

    const { data, action } = await yearUpsertHandler(year)

    return res.status(200).json({
      action,
      data,
    })
  } catch (error) {
    const _error = error as Error
    return res.status(400).json({
      cause: _error.cause,
      message: _error.message,
      name: _error.name,
    })
  }
}

export default handler
