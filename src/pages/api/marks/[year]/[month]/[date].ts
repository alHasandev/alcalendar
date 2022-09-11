import { NextApiHandler } from 'next'
import { prisma } from '@/server/db/client'
import { makeMonthId } from '@/server/db/models/month'
import { MonthIndex } from '@/utils/datetime'
import { makeDateId } from '@/server/db/models/date'
import { getDateQueryHandler } from '@/utils/query'

const getMarksOfMonth: NextApiHandler = async (req, res) => {
  const { year, month, date } = getDateQueryHandler(req.query, {
    year: new Date().getFullYear(),
    month: 0,
    date: 0,
  })

  const data = await prisma.mark.findMany({
    where: {
      dateId: {
        contains: makeDateId(new Date(year, month, date)),
      },
    },
  })

  return res.status(200).json({
    success: true,
    action: 'read',
    status: 'ok',
    data,
    // months,
  })
}

export default getMarksOfMonth
