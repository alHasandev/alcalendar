import { getDateRangeOffsets } from '@/utils/datetime'
import { getDate } from 'date-fns'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  const year = Number(req.query.year)

  if (isNaN(year))
    throw new TypeError('Year query not valid (YYYY) of numeric!')

  const data = getDateRangeOffsets(new Date(year, 8), (date) =>
    getDate(new Date(date._year, date._month, date._date))
  )

  return res.status(200).json({
    success: true,
    data,
  })
}

export default handler
