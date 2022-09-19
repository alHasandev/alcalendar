import fetchHolidays from '@/utils/fetch-holidays'
import { apiDataItemsToEvents } from '@/utils/holiday'
import { getDateQueryHandler } from '@/utils/query'
import { NextApiHandler } from 'next'

const getEventOfDate: NextApiHandler = async (req, res) => {
  const { year, month, date } = getDateQueryHandler(req.query, {
    year: new Date().getFullYear(),
    month: 0,
    date: 1,
  })

  const holidaysApi = await fetchHolidays({
    year,
    month: month - 1,
    date,
  })

  const data = apiDataItemsToEvents(holidaysApi.items)

  return res.status(200).json({
    success: true,
    action: 'read',
    status: 'ok',
    data: data,
  })
}

export default getEventOfDate
