import { NextApiHandler } from 'next'
import { yearUpsertHandler } from '@/utils/year'
import { getDateQueryHandler } from '@/utils/query'

const handler: NextApiHandler = async (req, res) => {
  try {
    const { year } = getDateQueryHandler(req.query, {
      year: new Date().getFullYear(),
    })

    const { data, action } = await yearUpsertHandler(year)

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
