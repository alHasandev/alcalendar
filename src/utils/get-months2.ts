import { Prisma } from '@prisma/client'
import {
  formatRFC3339,
  getDay,
  getDaysInMonth,
  getMonth,
  getWeek,
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

import fetchHolidays from './fetch-google-holidays'

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

export const getMonthlyHolidays = async (year: number) => {
  const holidaysData = await fetchHolidays({
    year: year,
  })

  const holidays = new Map<MonthIndex, Record<number, DateMark[]>>()

  holidaysData.items.map((item) => {
    const date = new Date(item.start.date)
    const d = date.getDate()
    const m = getMonth(date) as MonthIndex
    const holidaysInMonth = holidays.get(m)
    const mark = {
      type: item.eventType,
      summary: item.summary,
      description: item.description,
    }

    if (!holidaysInMonth) {
      const dateProps = {
        [d]: [mark],
      }

      holidays.set(m, dateProps)
    } else if (holidaysInMonth && !holidaysInMonth?.[d]) {
      const dateProps = {
        ...holidaysInMonth,
        [d]: [mark],
      }

      holidays.set(m, dateProps)
    } else {
      holidays.get(m)?.[d]?.push(mark)
    }
    return item
  })

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

export async function getYearlyMonths(year: number) {
  const holidays = await getMonthlyHolidays(year)
  const months: MonthProps[] = getMonthsNames((monthName, n) => {
    const monthIndex = n as MonthIndex
    const date = new Date(year, monthIndex, 1)

    const markeds = holidays.get(monthIndex)

    const month: MonthProps = {
      index: monthIndex,
      name: monthName,
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
