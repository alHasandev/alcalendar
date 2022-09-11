import { prisma } from '@/server/db/client'
import { makeDateId } from '@/server/db/models/date'
import { getDateQueryHandler } from '@/utils/query'
import { NextApiHandler } from 'next'

const getEventOfDate: NextApiHandler = async (req, res) => {
  const { year, month, date } = getDateQueryHandler(req.query, {
    year: new Date().getFullYear(),
    month: 0,
    date: 0,
  })

  const data = await prisma.dateData.findUnique({
    where: {
      id: makeDateId(new Date(year, month, date)),
    },
    include: {
      marks: true,
    },
  })

  return res.status(200).json({
    success: true,
    action: 'read',
    status: 'ok',
    data,
  })
}

export default getEventOfDate
