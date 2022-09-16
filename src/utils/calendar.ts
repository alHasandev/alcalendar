import { readFile, writeFile } from 'fs/promises'

import { composeDateData } from '@/server/db/models/date'
import { composeMonth, MonthPayload } from '@/server/db/models/month/create'
import { getDateRange, getMonthNames } from './datetime'
import path from 'path'

export const staticPath = (year: number) => {
  const dir = 'public/static/'
  const processDir = path.join(process.cwd(), dir)
  return `${processDir}${year}.json`
}

export interface Calendar {
  id: string
  year: number
  months: MonthPayload[]
}

export const createCalendar = (year: number) => ({
  id: `default:${year}`,
  year: year,
  months: getMonthNames((name, m) => {
    const dates = getDateRange(year, m, ({ _date }) => {
      return composeDateData(new Date(year, m, _date), [])
    })

    return composeMonth(
      year,
      { name, index: m },
      {
        dates,
      }
    )
  }),
})

export const saveCalendar = (calendar: Calendar) => {
  const year = calendar.year

  return writeFile(staticPath(year), JSON.stringify(calendar))
}

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

export const getCalendar = async <T extends Args>(args: T) => {
  const json = await readFile(staticPath(args.year), 'utf8')
  const data = JSON.parse(json) as Calendar

  if (args?.month !== undefined && args?.date !== undefined)
    return data.months[args.month]?.dates[args.date - 1] as TCalendar<T>

  if (args?.month !== undefined) {
    return data.months[args.month] as TCalendar<T>
  }

  return data as TCalendar<T>
}
