import { prisma } from '@/server/db/client'
import { makeMonthId } from '@/server/db/models/month'
import { MonthIndex } from '@/utils/datetime'
import { getDateQueryHandler } from '@/utils/query'
import { NextApiHandler } from 'next'

const includeOnlyMarkedDates = (markedDateIdQuery: string) => ({
  dates: {
    where: {
      NOT: {
        marks: {
          none: {
            dateId: {
              contains: markedDateIdQuery,
            },
          },
        },
      },
    },
    include: {
      marks: true,
    },
  },
})

const getEventOfMonth: NextApiHandler = async (req, res) => {
  const { year, month } = getDateQueryHandler(req.query, {
    year: new Date().getFullYear(),
    month: 0,
  })

  const data = await prisma.month.findUnique({
    where: {
      id: makeMonthId(year, month as MonthIndex),
    },
    include: includeOnlyMarkedDates(`${year}`),
  })

  return res.status(200).json({
    success: true,
    action: 'read',
    status: 'ok',
    data,
  })
}

export default getEventOfMonth
