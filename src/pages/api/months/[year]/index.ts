import { NextApiHandler } from 'next'
import { prisma } from '@/server/db/client'
import { getDateQueryHandler } from '@/utils/query'

const getMarksOfYear: NextApiHandler = async (req, res) => {
  const { year } = getDateQueryHandler(req.query, {
    year: new Date().getFullYear(),
  })

  const data = await prisma.month.findMany({
    where: {
      yearId: year,
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

export default getMarksOfYear
