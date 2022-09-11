import { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/server/db/client'
import { yearArgs } from '@/utils/year'
import { getDateQueryHandler } from '@/utils/query'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { year } = getDateQueryHandler(req.query, {
      year: new Date().getFullYear(),
    })

    const data = await prisma.year.findUnique({
      where: {
        id: year,
      },
      include: yearArgs.include,
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
