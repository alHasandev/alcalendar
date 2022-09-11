import { prisma } from '@/server/db/client'
import { NextApiHandler } from 'next'

const selectWhereMarkedOnYear = (year: number) => ({
  NOT: {
    dates: {
      every: {
        marks: {
          every: {
            dateId: `${year}`,
          },
        },
      },
    },
  },
})

const includeWhereMarkedOnYear = (year: number) => ({
  dates: {
    where: {
      NOT: {
        marks: {
          none: {
            dateId: {
              contains: `${year}`,
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

const handler: NextApiHandler = async (req, res) => {
  const year = Number(req.query.year)

  if (isNaN(year))
    throw new TypeError('Year query not valid (YYYY) of numeric!')

  const months = await prisma.month.findMany({
    where: selectWhereMarkedOnYear(year),
    include: includeWhereMarkedOnYear(year),
  })

  return res.status(200).json({
    success: true,
    yearData: {
      yearId: year,
      markedMonthCount: months.length,
    },
    months,
  })
}

export default handler
