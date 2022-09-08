import {
  getDate,
  getDay,
  getDaysInMonth,
  getMonth,
  getWeek,
  getWeeksInMonth,
  lastDayOfMonth,
  startOfWeek,
} from 'date-fns'
import fetchHolidays from './fetch-google-holidays'

export const DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  "Jum'at",
  'Sabtu',
] as const

export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

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

export type MonthIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
export type MonthName = typeof MONTH_NAMES[MonthIndex]
export type DateMark = {
  type: MarkType
  summary: string
  description?: string
}

export type MarkType =
  | 'libur-mingguan'
  | 'libur-nasional'
  | 'cuti-bersama'
  | 'app-event'
  | 'prev-offset'
  | 'next-offset'
  | 'holiday'
  | 'leave'

export type DateProps = {
  rawDate: Date | string
  date: number
  dayName: DayName
  dayIndex: DayIndex
  weekIndex: number
  marks?: DateMark[]
}

export const getDayName = (dayOfWeek: DayIndex) => {
  return DAY_NAMES[dayOfWeek]
}

export type MarkedDate = DateMark & DateProps
export type MonthProps = {
  index: MonthIndex
  name: MonthName
  daysCount: number
  weeksCount: number
  dates: DateProps[]
  // markedDates: Record<number, MarkedDate[]> | null
}
export const getMonthName = (monthIndex: MonthIndex) => {
  return MONTH_NAMES[monthIndex]
}

export const makeDateProps = (date: Date, marks?: DateMark[]) => {
  const dateProps: DateProps = {
    rawDate: date.toDateString(),
    date: getDate(date),
    dayName: getDayName(getDay(date)),
    dayIndex: getDay(date),
    weekIndex: getWeek(date),
    marks: marks || [],
  }

  return dateProps
}

export const makeMarkedDate = (date: Date, mark: DateMark) => {
  const markedDate: MarkedDate = {
    rawDate: date.toDateString(),
    date: getDate(date),
    dayName: getDayName(getDay(date)),
    dayIndex: getDay(date),
    weekIndex: getWeek(date),
    type: mark.type,
    summary: mark.summary,
  }

  return markedDate
}

export function range<T>(
  options: { from?: number; step?: number; to: number },
  callback: (_n: number) => T = (n) => n as unknown as T
) {
  const { from = 0, step = 1, to } = options

  if (!to) {
    throw Error('"to" must be specified')
  }

  if (to <= from) {
    return [] as T[]
  }

  const ranges = Array.from(
    { length: Math.ceil((to - from + 1) / step) },
    (_, i) => callback(i * step + from)
  ) as T[]

  return ranges
}

export const getDateRange = (
  year: number,
  monthIndex: MonthIndex,
  markedDates: Record<number, MarkedDate[]>
) => {
  const firstDate = new Date(year, monthIndex, 1)
  const dayOfWeek = getDay(firstDate)
  const lastDate = lastDayOfMonth(firstDate)
  const lastDay = getDay(lastDate)
  const marks = markedDates

  const daysCount = getDaysInMonth(firstDate)

  const formatter = (year: number, m: MonthIndex, n: number) => {
    return makeDateProps(new Date(year, m, n), marks?.[n])
  }

  const dateRange: DateProps[] = range(
    {
      from: 1,
      to: daysCount,
    },
    (n) => formatter(year, monthIndex, n)
  )

  let preOffset: DateProps[] = []

  if (dayOfWeek !== 0) {
    const firstDateOfWeek = getDate(startOfWeek(firstDate))

    const lastDateOfWeek = firstDateOfWeek + dayOfWeek - 1
    preOffset = range({ from: firstDateOfWeek, to: lastDateOfWeek }, (n) => {
      const prevM = (monthIndex - 1 >= 0 ? monthIndex - 1 : 11) as MonthIndex
      return makeDateProps(new Date(year, monthIndex, n), [
        {
          type: 'prev-offset',
          summary: getMonthName(prevM),
          description: 'Bulan sebelumnya',
        },
      ])
    })
  }

  let postOffset: DateProps[] = []
  if (lastDay < 6) {
    postOffset = range({ from: 1, to: 6 - lastDay }, (n) => {
      const nextM = (monthIndex + 1 <= 11 ? monthIndex + 1 : 0) as MonthIndex
      return makeDateProps(new Date(year, monthIndex, n), [
        {
          type: 'next-offset',
          summary: getMonthName(nextM),
          description: 'Bulan selanjutnya',
        },
      ])
    })
  }

  return [...preOffset, ...dateRange, ...postOffset]
}

export async function getMonthlyDates(year: number) {
  const holidaysData = await fetchHolidays({
    year: year,
  })

  const holidays = new Map<number, Map<number, MarkedDate[]>>()

  holidaysData.items.map((item) => {
    const date = new Date(item.start.date)
    const m = getMonth(date)
    const d = getDate(date)

    if (holidays.has(m)) {
      if (holidays.get(m)?.has(d)) {
        holidays
          .get(m)
          ?.get(d)
          ?.push(
            makeMarkedDate(date, {
              type: 'libur-nasional',
              summary: item.summary,
            })
          )
      } else {
        holidays.get(m)?.set(d, [
          makeMarkedDate(date, {
            type: 'libur-nasional',
            summary: item.summary,
          }),
        ])
      }
    } else {
      holidays.set(
        m,
        new Map().set(d, [
          makeMarkedDate(date, {
            type: 'libur-nasional',
            summary: item.summary,
          }),
        ])
      )
    }
  })

  const months: MonthProps[] = MONTH_NAMES.map((monthName, n) => {
    const m = n as MonthIndex
    const date = new Date(year, m, 1)

    const markedDates: Record<number, MarkedDate[]> = {}

    if (holidays.has(m)) {
      holidays.get(m)?.forEach((h, k) => {
        markedDates[k] = h
      })
    }

    const month: MonthProps = {
      index: m,
      name: monthName,
      daysCount: getDaysInMonth(date),
      weeksCount: getWeeksInMonth(date),
      dates: getDateRange(year, m, markedDates),
      // markedDates,
    }

    return month
  })

  return months
}
