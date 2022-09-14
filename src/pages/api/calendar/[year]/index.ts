import { NextApiRequest, NextApiResponse } from 'next'

import { getDateQueryHandler } from '@/utils/query'
import { getCalendar } from '@/utils/calendar'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { year } = getDateQueryHandler(req.query, {
      year: new Date().getFullYear(),
    })

    const data = await getCalendar({ year })

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
