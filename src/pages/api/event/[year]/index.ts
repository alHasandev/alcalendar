import { prisma } from '@/server/db/client'
import { getDateQueryHandler } from '@/utils/query'
import { NextApiHandler } from 'next'

const selectOnlyMarkedDates = (markedDateIdQuery: string) => ({
  NOT: {
    dates: {
      every: {
        marks: {
          none: {
            dateId: {
              contains: markedDateIdQuery,
            },
          },
        },
      },
    },
  },
})

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

const getEventOfYear: NextApiHandler = async (req, res) => {
  const { year } = getDateQueryHandler(req.query, {
    year: new Date().getFullYear(),
  })

  const months = await prisma.month.findMany({
    where: selectOnlyMarkedDates(`${year}`),
    include: includeOnlyMarkedDates(`${year}`),
  })

  const yearData = await prisma.year.findUnique({
    where: {
      id: year,
    },
  })

  return res.status(200).json({
    success: true,
    action: 'read',
    status: 'ok',
    data: { ...yearData, months },
    // months,
  })
}

export default getEventOfYear
