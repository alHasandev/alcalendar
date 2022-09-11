import { NextApiHandler } from 'next'
import { prisma } from '@/server/db/client'
import { makeMonthId } from '@/server/db/models/month'
import { MonthIndex } from '@/utils/datetime'
import { getDateQueryHandler } from '@/utils/query'

const getMarksOfMonth: NextApiHandler = async (req, res) => {
  const { year, month } = getDateQueryHandler(req.query, {
    year: new Date().getFullYear(),
    month: 0,
  })

  const data = await prisma.month.findUnique({
    where: {
      id: makeMonthId(year, month as MonthIndex),
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
