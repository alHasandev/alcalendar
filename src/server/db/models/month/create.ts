import { getMonthNames, MonthIndex, MonthName } from '@/utils/datetime'
import { Prisma } from '@prisma/client'

import { IndexedMarks } from '@/utils/holiday'
import { format, getDaysInMonth, getWeeksInMonth } from 'date-fns'
import { getWeek } from 'date-fns'

export type MonthProps = Prisma.MonthCreateWithoutYearInput

export type MonthMarksMap = Map<MonthIndex, IndexedMarks>

export const makeMonthId = (year: number, monthIndex: MonthIndex) =>
  format(new Date(year, monthIndex), 'yyyy-MM')

export const createMonthWithoutYearInput = (
  year: number,
  month: {
    index: MonthIndex
    name: MonthName
  },
  optionals?: Partial<Prisma.MonthCreateInput>
) => {
  const date = new Date(year, month.index, 1)

  const monthProps: MonthProps = {
    id: makeMonthId(year, month.index),
    index: month.index,
    name: month.name,
    daysCount: getDaysInMonth(date),
    weeksCount: getWeeksInMonth(date),
    weekIndex: getWeek(date),
    ...optionals,
  }

  return monthProps
}

type OptionalsSetter = (_month: {
  index: MonthIndex
  name: MonthName
}) => Partial<Prisma.MonthCreateInput>

const defaultSetter: OptionalsSetter = () => ({})

export async function createMonthRange(
  year: number,
  setOptionals?: OptionalsSetter
) {
  const getOptionals = setOptionals || defaultSetter

  const months: MonthProps[] = getMonthNames((name, index) =>
    createMonthWithoutYearInput(
      year,
      { name, index },
      getOptionals({ name, index })
    )
  )

  return months
}
