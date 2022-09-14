import { NextApiHandler } from 'next'
import { getDateQueryHandler } from '@/utils/query'
import { createCalendar, saveCalendar } from '@/utils/calendar'
import { prisma } from '@/server/db/client'
import { pushMarkToStaticData } from '@/server/db/models/mark'
import { createMonthRange } from '@/server/db/models/month/create'

const handler: NextApiHandler = async (req, res) => {
  try {
    const { year } = getDateQueryHandler(req.query, {
      year: new Date().getFullYear(),
    })

    const data = createCalendar(year)

    const marks = await prisma.mark.findMany({
      where: {
        year,
      },
    })

    pushMarkToStaticData(marks, (m, n) => data.months?.[m]?.dates?.[n]?.marks)

    saveCalendar(data)

    const action = 'updated'

    await prisma.year.upsert({
      where: {
        id: year,
      },
      create: {
        id: year,
        months: {
          createMany: {
            data: await createMonthRange(year),
          },
        },
      },
      update: {},
    })

    return res.status(200).json({
      action,
      data,
      marks,
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
