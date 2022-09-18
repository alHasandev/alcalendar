import { NextApiHandler } from 'next'
import { getDateQueryHandler } from '@/utils/query'
import { createCalendar } from '@/utils/calendar'
import fetchHolidays from '@/utils/fetch-holidays'
import {
  Event,
  pushEventToStaticData,
  saveCalendar,
} from '@/server/redis/calendar'
import { apiDataItemsToEvents } from '@/utils/holiday'
import { env } from '@/env/server.mjs'

const handler: NextApiHandler = async (req, res) => {
  try {
    const { year } = getDateQueryHandler(req.query, {
      year: new Date().getFullYear(),
    })

    const data = createCalendar(year)

    const apiData = await fetchHolidays({
      year,
    })

    const events: Event[] = apiDataItemsToEvents(apiData.items)

    pushEventToStaticData(events, (m, n) => data.months?.[m]?.dates[n]?.events)

    const dataKey = `calendar#${year}`

    const calendar = await saveCalendar(dataKey, data)

    const action = 'updated'

    return res.status(200).json({
      action,
      data: calendar,
      cache: {
        link: `${env.UPSTASH_REDIS_REST_URL}/hget/calendar/${dataKey}`,
        authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      },
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
