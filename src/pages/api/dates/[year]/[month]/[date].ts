import { NextApiHandler } from 'next'
import { prisma } from '@/server/db/client'
import { makeDateId } from '@/server/db/models/date'
import { getDateQueryHandler } from '@/utils/query'

const getMarksOfMonth: NextApiHandler = async (req, res) => {
  const { year, month, date } = getDateQueryHandler(req.query, {
    year: new Date().getFullYear(),
    month: 0,
    date: 0,
  })

  const data = await prisma.dateData.findUnique({
    where: {
      id: makeDateId(new Date(year, month, date)),
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
