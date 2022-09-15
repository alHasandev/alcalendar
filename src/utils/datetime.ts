import {
  addDays,
  getDate,
  getDay,
  getDaysInMonth,
  getMonth,
  lastDayOfMonth,
  setDefaultOptions,
  subMonths,
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

export const getMonthNames = <T>(
  callback: (_monthName: MonthName, _monthIndex: MonthIndex) => T
) => {
  return MONTH_NAMES.map((value, i) => callback(value, i as MonthIndex))
}

export const getDayNames = <T>(
  callback: (_dayName: DayName, _dayIndex: DayIndex) => T
) => {
  return DAY_NAMES.map((value, i) => callback(value, i as DayIndex))
}

export const getDayName = (dayOfWeek: DayIndex) => {
  return DAY_NAMES.at(dayOfWeek) || 'Minggu'
}
export const getMonthName = (monthIndex: MonthIndex) => {
  return MONTH_NAMES.at(monthIndex) || 'Januari'
}

type DateRangeFormatterArgs = {
  _year: number
  _month: MonthIndex
  _date: number
}

interface DateRangeOffsetFormatterArgs extends DateRangeFormatterArgs {
  _type: 'prev' | 'current' | 'next'
}

type DateRangeFormatter<T> = (_data: DateRangeFormatterArgs) => T
type DateRangeOffsetFormatter<T> = (_data: DateRangeOffsetFormatterArgs) => T

const defaultFormatter = (args: DateRangeFormatterArgs) =>
  new Date(args._year, args._month, args._date, TO)

const defaultOffsetFormatter = (args: DateRangeFormatterArgs) =>
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

  const daysCount = getDaysInMonth(firstDate)

  const dateRange = range(
    {
      from: 1,
      to: daysCount,
    },
    (n) => mutator({ _year: year, _month: monthIndex, _date: n })
  )

  return dateRange
}

export const getDateRangeOffsets = <T = Date>(
  date: Date,
  formatter?: DateRangeOffsetFormatter<T>
) => {
  const mutator = (
    !formatter ? defaultOffsetFormatter : formatter
  ) as DateRangeOffsetFormatter<T>

  // const monthIndex = date.getMonth()
  const dayOfWeek = getDay(date)

  const lastDate = lastDayOfMonth(date)
  const lastDay = getDay(lastDate)

  let prevOffset: T[] = []

  if (dayOfWeek !== 0) {
    const prevMonth = subMonths(date, 1)
    const to = getDate(lastDayOfMonth(prevMonth))
    const from = to - dayOfWeek + 1
    const prevY = prevMonth.getFullYear()
    const prevM = getMonth(prevMonth) as MonthIndex

    prevOffset = range({ from, to }, (n) => {
      return mutator({ _year: prevY, _month: prevM, _date: n, _type: 'prev' })
    })
  }

  let nextOffset: T[] = []
  if (lastDay < 6) {
    const from = addDays(lastDate, 1)
    const nextY = from.getFullYear()

    const toDate = 6 - lastDay
    nextOffset = range({ from: 1, to: toDate }, (n) => {
      const nextM = from.getMonth() as MonthIndex
      return mutator({ _year: nextY, _month: nextM, _date: n, _type: 'next' })
    })
  }

  return {
    prev: prevOffset,
    next: nextOffset,
  }
}

export const getDateRangeWithOffsets = <T = Date>(
  year: number,
  monthIndex: MonthIndex,
  formatter?: DateRangeOffsetFormatter<T>
) => {
  const mutator = (
    !formatter ? defaultFormatter : formatter
  ) as DateRangeOffsetFormatter<T>

  const firstDate = new Date(year, monthIndex, 1)

  const daysCount = getDaysInMonth(firstDate)

  const dateRange = range(
    {
      from: 1,
      to: daysCount,
    },
    (n) =>
      mutator({ _year: year, _month: monthIndex, _date: n, _type: 'current' })
  )

  const { prev: prevOffset, next: nextOffset } = getDateRangeOffsets(firstDate)

  return [...prevOffset, ...dateRange, ...nextOffset] as T[]
}
