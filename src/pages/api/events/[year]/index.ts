import fetchHolidays from '@/utils/fetch-holidays'
import { apiDataItemsToEvents } from '@/utils/holiday'
import { getDateQueryHandler } from '@/utils/query'
import { NextApiHandler } from 'next'

const getEventOfYear: NextApiHandler = async (req, res) => {
  const { year } = getDateQueryHandler(req.query, {
    year: new Date().getFullYear(),
  })

  const holidaysApi = await fetchHolidays({ year })

  const data = apiDataItemsToEvents(holidaysApi.items)

  return res.status(200).json({
    success: true,
    action: 'read',
    status: 'ok',
    data: data,
  })
}

export default getEventOfYear
