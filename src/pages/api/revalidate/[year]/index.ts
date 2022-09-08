import { NextApiHandler } from 'next'

import { prisma } from '@/server/db/client'
import { getYearlyMonths } from '@/utils/get-months2'

const handler: NextApiHandler = async (req, res) => {
  try {
    const year = Number(req.query.year)

    if (isNaN(year))
      throw new TypeError('Year query not valid (YYYY) of numeric!')

    // await prisma.mark.deleteMany()
    // await prisma.date.deleteMany()
    // await prisma.month.deleteMany()

    // const data = await prisma.year.deleteMany()

    // return res.status(200).json({ data })

    const months = await getYearlyMonths(year)

    const yearData = await prisma.year.upsert({
      where: { fullYear: year },
      update: {},
      create: {
        fullYear: year,
        months: {
          create: months,
        },
      },
    })

    const monthsData = await prisma.month.findMany({
      where: {
        yearId: yearData?.id,
        index: 0,
      },
      include: {
        dates: {
          include: {
            marks: true,
          },
        },
      },
    })

    // const holidays = await getMonthlyHolidays(year)

    return res.status(200).json({
      data: yearData,
      months: monthsData,
      // holidays: holidays.get(1),
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
