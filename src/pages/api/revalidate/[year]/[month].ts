import { NextApiHandler } from 'next'
import { getDateQueryHandler } from '@/utils/query'
import { monthUpsertHandler } from '@/utils/month'
import { MonthIndex } from '@/utils/datetime'

const handler: NextApiHandler = async (req, res) => {
  try {
    const { year, month } = getDateQueryHandler(req.query, {
      year: new Date().getFullYear(),
      month: 0,
    })

    const { data, action } = await monthUpsertHandler(year, month as MonthIndex)

    return res.status(200).json({
      action,
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

export default handler
