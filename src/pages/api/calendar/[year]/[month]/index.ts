import { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/server/db/client'
import { yearArgs } from '@/utils/year'
import { makeMonthId } from '@/server/db/models/month'
import { MonthIndex } from '@/utils/datetime'
import { getDateQueryHandler } from '@/utils/query'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { year, month } = getDateQueryHandler(req.query, {
      year: new Date().getFullYear(),
      month: 0,
    })

    const monthId = makeMonthId(year, month as MonthIndex)
    const data = await prisma.month.findUnique({
      where: {
        id: monthId,
      },
      include: yearArgs.include.months.include,
    })

    if (!data)
      return res.status(404).json({
        status: 'not-found',
        action: 'read',
        data,
      })

    return res.status(200).json({
      status: 'ok',
      action: 'read',
      data,
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
