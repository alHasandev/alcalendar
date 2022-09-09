import fetchHolidays, {
  googleHolidaysReducer,
} from '@/utils/fetch-google-holidays'
import { holidaysObjConverter } from '@/utils/get-months2'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  const year = Number(req.query.year)

  if (isNaN(year))
    throw new TypeError('Year query not valid (YYYY) of numeric!')

  const holidays = await fetchHolidays({
    year: year,
  })

  const reduced = holidaysObjConverter(holidays.items, googleHolidaysReducer)

  return res.status(200).json({
    success: true,
    reduced,
  })
}

export default handler
