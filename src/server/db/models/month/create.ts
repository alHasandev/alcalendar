import { getMonthNames, MonthIndex, MonthName } from '@/utils/datetime'
import { DateData, Month, Prisma } from '@prisma/client'

import { IndexedMarks } from '@/utils/holiday'
import { format, getDaysInMonth, getWeeksInMonth } from 'date-fns'
import { getWeek } from 'date-fns'
import { Mark } from '@/server/db/models/mark'
import { DateDataPayload } from '../date'

export type MonthProps = Prisma.MonthCreateWithoutYearInput

export type SelectMarkField = {
  select: {
    id: true
    dateId: true
    type: true
    summary: true
    description: true
    year: true
    month: true
  }
}

export type MarkPayload = Prisma.MarkGetPayload<SelectMarkField>

export type MonthPayload = Prisma.MonthGetPayload<{
  include: {
    dates: {
      include: {
        marks: SelectMarkField
      }
    }
  }
}>

export type MonthMarksMap = Map<MonthIndex, IndexedMarks>

export const makeMonthId = (year: number, monthIndex: MonthIndex) =>
  format(new Date(year, monthIndex), 'yyyy-MM')

export type MonthOptionalField = {
  dates?: (DateData & {
    marks: Mark[]
  })[]
}

export const composeMonth = (
  year: number,
  month: {
    index: MonthIndex
    name: MonthName
  },
  optionals?: MonthOptionalField
) => {
  const date = new Date(year, month.index, 1)

  const monthProps: MonthPayload = {
    id: makeMonthId(year, month.index),
    yearId: year,
    updatedAt: new Date(),
    index: month.index,
    name: month.name,
    daysCount: getDaysInMonth(date),
    weeksCount: getWeeksInMonth(date),
    weekIndex: getWeek(date),
    dates: optionals?.dates || ([] as (DateData & { marks: Mark[] })[]),
  }

  return monthProps
}

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
