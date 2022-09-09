import { Prisma } from '@prisma/client'
import {
  formatRFC3339,
  getDay,
  getDaysInMonth,
  getTime,
  getWeekOfMonth,
  getWeeksInMonth,
} from 'date-fns'
import {
  getDateRange,
  getDayName,
  getMonthName,
  getMonthsNames,
  MonthIndex,
} from './datetime'

import fetchHolidays, { googleHolidaysReducer } from './fetch-google-holidays'

export type DateMark = Prisma.MarkCreateWithoutDateInput
export type DateMarks = Prisma.MarkCreateNestedManyWithoutDateInput

export type MarkType =
  | 'default'
  | 'app-event'
  | 'prev-month'
  | 'next-month'
  | 'prev-year'
  | 'next-year'
  | 'holiday'
  | 'leave'

export type DateProps = Prisma.DateCreateWithoutMonthInput
export type DatesProps = Prisma.DateCreateNestedManyWithoutMonthInput

export type MarkedDate = DateProps
export type MarkedDates = Record<number, DateProps>
export type MonthProps = Prisma.MonthCreateWithoutYearInput

export const makeDateProps = (date: Date, marks?: DateMarks) => {
  const dateProps: DateProps = {
    rawDate: formatRFC3339(date),
    date: date.getDate(),
    dayName: getDayName(getDay(date)),
    dayIndex: getDay(date),
    weekIndex: getWeekOfMonth(date, {
      weekStartsOn: 0,
    }),
    marks,
  }

  return dateProps
}

const dateFormatter = (
  year: number,
  m: MonthIndex,
  n: number,
  markeds?: DateMark[]
) => {
  return makeDateProps(new Date(year, m, n), {
    create: markeds,
  })
}

export type IndexedMarks = Record<number, DateMark[]>
export type MonthMarksMap = Map<MonthIndex, IndexedMarks>

export type MarksReducer<T> = (
  _prev: Record<number, IndexedMarks>,
  _curr: T,
  _index: number,
  _array: T[]
) => Record<number, IndexedMarks>

export const objToMap = <K extends string | number | symbol, V>(
  obj: Record<K, V>
) => {
  const map = Object.keys(obj).reduce((prev, curr) => {
    prev.set(curr as K, obj[curr as K])

    return prev
  }, new Map<K, V>())

  return map
}

export const holidaysObjConverter = <T>(
  items: T[],
  reducer: MarksReducer<T>
) => {
  const reduced: Record<MonthIndex, IndexedMarks> = items.reduce(
    reducer,
    Object.create(null)
  )

  return reduced
}

export const getHolidaysMap = async (year: number) => {
  const holidaysData = await fetchHolidays({
    year: year,
  })

  const holidays: Record<MonthIndex, IndexedMarks> = holidaysObjConverter(
    holidaysData.items,
    googleHolidaysReducer
  )

  return holidays
}

const createDateRange = (
  year: number,
  monthIndex: MonthIndex,
  markeds?: Record<number, DateMark[]>
) =>
  getDateRange(year, monthIndex, ({ _year, _month, _date }) => {
    if (year === _year && monthIndex === _month) {
      return dateFormatter(_year, _month, _date, markeds?.[_date])
    }

    let type: MarkType = 'default'
    let description = ''

    if (year > _year) {
      type = 'prev-year'
      description = 'Tahun sebelumnya'
    } else if (year < _year) {
      type = 'next-year'
      description = 'Tahun selannjutnya'
    } else {
      if (monthIndex > _month) {
        type = 'prev-month'
        description = 'Bulan sebelumnya'
      } else {
        type = 'next-month'
        description = 'Bulan selanjutnya'
      }
    }

    return dateFormatter(_year, _month, _date, [
      {
        type,
        description,
        summary: getMonthName(_month),
      },
    ])
  })

export async function getYearlyMonths(
  year: number,
  monthMarksMap?: MonthMarksMap
) {
  const monthMarks: MonthMarksMap = monthMarksMap || new Map()

  const months: MonthProps[] = getMonthsNames((monthName, n) => {
    const monthIndex = n as MonthIndex
    const date = new Date(year, monthIndex, 1)
    const markeds = monthMarks.get(monthIndex)

    const month: MonthProps = {
      index: monthIndex,
      name: monthName,
      updated: formatRFC3339(new Date()),
      daysCount: getDaysInMonth(date),
      weeksCount: getWeeksInMonth(date),
      dates: {
        create: createDateRange(year, monthIndex, markeds),
      },
    }

    return month
  })

  return months
}
