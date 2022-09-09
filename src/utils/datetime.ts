import {
  addDays,
  getDay,
  getDaysInMonth,
  lastDayOfMonth,
  setDefaultOptions,
  startOfWeek,
} from 'date-fns'
import { id } from 'date-fns/locale'
import { IndexType, range } from './array'

// Default options for date-fns
setDefaultOptions({
  locale: id,
})

/**
 * Timezone Offset value
 * @Type Number (positive or negative without + (plus))
 * @Default 8 (central indonesia time)
 */
export const TO = 8

export const DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  "Jum'at",
  'Sabtu',
] as const

export type DayIndex = IndexType<typeof DAY_NAMES>

export type DayName = typeof DAY_NAMES[DayIndex]

export const MONTH_NAMES = [
  'Januari',
  'Pebruari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const

export type MonthIndex = IndexType<typeof MONTH_NAMES>
export type MonthName = typeof MONTH_NAMES[MonthIndex]

export const getMonthsNames = <T = unknown, P = typeof MONTH_NAMES>(
  callback?: (_monthName: MonthName, _monthIndex: MonthIndex) => T
) => {
  if (!!callback)
    return MONTH_NAMES.map((value, i) => callback(value, i as MonthIndex)) as P

  return MONTH_NAMES as P
}

export const getDaysNames = <T = unknown, P = typeof DAY_NAMES>(
  callback?: (_dayName: DayName, _dayIndex: DayIndex) => T
) => {
  if (!!callback)
    return DAY_NAMES.map((value, i) => callback(value, i as DayIndex)) as P

  return DAY_NAMES as P
}

export const getDayName = (dayOfWeek: DayIndex) => {
  return DAY_NAMES[dayOfWeek]
}
export const getMonthName = (monthIndex: MonthIndex) => {
  return MONTH_NAMES[monthIndex]
}

type DateRangeFormatterArgs = {
  _year: number
  _month: MonthIndex
  _date: number
}

type DateRangeFormatter<T> = (_data: DateRangeFormatterArgs) => T

const defaultFormatter = (args: DateRangeFormatterArgs) =>
  new Date(args._year, args._month, args._date, TO)

export const getDateRange = <T = Date>(
  year: number,
  monthIndex: MonthIndex,
  formatter?: DateRangeFormatter<T>
) => {
  const mutator = (
    !formatter ? defaultFormatter : formatter
  ) as DateRangeFormatter<T>

  const firstDate = new Date(year, monthIndex, 1)
  const dayOfWeek = getDay(firstDate)
  const lastDate = lastDayOfMonth(firstDate)
  const lastDay = getDay(lastDate)

  const daysCount = getDaysInMonth(firstDate)

  const dateRange = range(
    {
      from: 1,
      to: daysCount,
    },
    (n) => mutator({ _year: year, _month: monthIndex, _date: n })
  )

  let preOffset: T[] = []

  if (dayOfWeek !== 0) {
    const from = startOfWeek(firstDate)
    const fromDate = from.getUTCDate()
    const prevY = from.getFullYear()
    console.log('preOffset', fromDate)

    const toDate = fromDate + dayOfWeek - 1
    preOffset = range({ from: fromDate, to: toDate }, (n) => {
      const prevM = (monthIndex - 1 >= 0 ? monthIndex - 1 : 11) as MonthIndex
      return mutator({ _year: prevY, _month: prevM, _date: n })
    })
  }

  let postOffset: T[] = []
  if (lastDay < 6) {
    const from = addDays(lastDate, 1)
    const nextY = from.getFullYear()

    const toDate = 6 - lastDay
    postOffset = range({ from: 1, to: toDate }, (n) => {
      const nextM = (monthIndex + 1 <= 11 ? monthIndex + 1 : 0) as MonthIndex
      return mutator({ _year: nextY, _month: nextM, _date: n })
    })
  }

  return [...preOffset, ...dateRange, ...postOffset] as T[]
}
