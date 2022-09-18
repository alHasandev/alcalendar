import { getDateRange, getMonthNames } from './datetime'
import path from 'path'
import {
  Calendar,
  createDateData,
  createMonth,
  Event,
  fetchCalendar,
  pushEventToStaticData,
  saveCalendar,
} from '@/server/redis/calendar'
import fetchHolidays from './fetch-holidays'
import { apiDataItemsToEvents } from './holiday'

export const staticPath = (year: number) => {
  const dir = 'public/static/'
  const processDir = path.join(process.cwd(), dir)
  return `${processDir}${year}.json`
}

export const createCalendar = (year: number) => ({
  id: `default:${year}`,
  year: year,
  months: getMonthNames((name, index) => {
    const dates = getDateRange(year, index, ({ _date }) => {
      return createDateData(new Date(year, index, _date), [])
    })

    return createMonth(year, { name, index }, dates)
  }),
})

// export const saveCalendar = (calendar: Calendar) => {
//   const year = calendar.year

//   return writeFile(staticPath(year), JSON.stringify(calendar))
// }

type Args = {
  year: number
  month?: number
  date?: number
}

type YearMonth = {
  year: number
  month: number
}

type YearMonthDate = YearMonth & {
  date: number
}

type MonthData = Calendar['months'][number]

type TCalendar<T> = T extends YearMonth
  ? MonthData
  : T extends YearMonthDate
  ? MonthData['dates'][number]
  : Calendar

const handleCalendarResult = <T extends Args>(data: Calendar, args: T) => {
  if (args?.month !== undefined && args?.date !== undefined)
    return data.months[args.month]?.dates[args.date - 1] as TCalendar<T>

  if (args?.month !== undefined) {
    return data.months[args.month] as TCalendar<T>
  }

  return data as TCalendar<T>
}

export const getCalendar = async <T extends Args>(args: T) => {
  const data: Calendar | null = await fetchCalendar(`calendar#${args.year}`)

  if (!data) {
    const apiData = await fetchHolidays({
      year: args.year,
    })
    const events: Event[] = apiDataItemsToEvents(apiData.items)

    const calendar = createCalendar(args.year)

    pushEventToStaticData(
      events,
      (m, n) => calendar.months?.[m]?.dates[n]?.events
    )

    const newCalendar = await saveCalendar(`calendar#${args.year}`, calendar)
    return handleCalendarResult(newCalendar, args)
  }

  return handleCalendarResult(data, args)
}
