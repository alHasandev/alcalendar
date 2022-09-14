import { NextApiHandler } from 'next'

import { prisma } from '@/server/db/client'
import { getDateQueryHandler } from '@/utils/query'
import fetchHolidays from '@/utils/fetch-holidays'
import { makeDateId } from '@/server/db/models/date'

const handler: NextApiHandler = async (req, res) => {
  try {
    const { year } = getDateQueryHandler(req.query, {
      year: new Date().getFullYear(),
    })

    const apiData = await fetchHolidays({
      year,
    })

    await prisma.mark.deleteMany({
      where: {
        authorId: apiData.etag,
      },
    })

    const data = await prisma.mark.createMany({
      data: apiData.items.map((holiday) => {
        const date = new Date(holiday.start.date)
        return {
          dateId: makeDateId(date),
          year: year,
          month: date.getMonth(),
          type: holiday.eventType,
          summary: holiday.summary,
          description: holiday.description,
          authorId: apiData.etag,
        }
      }),
    })

    const action = 'updated'

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
