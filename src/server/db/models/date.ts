import { getDayName, MonthIndex } from '@/utils/datetime'
import { Prisma } from '@prisma/client'
import { format, getDate, getDay, getWeek, setDefaultOptions } from 'date-fns'
import { id } from 'date-fns/locale'
import { Mark } from './mark'
import { makeMonthId } from './month'

// Default options for date-fns
setDefaultOptions({
  locale: id,
})

export type DateProps = Prisma.DateDataUncheckedCreateWithoutMonthInput
export type DatesProps = Prisma.DateDataCreateNestedManyWithoutMonthInput

export type MarkedDate = DateProps
export type MarkedDates = Record<number, DateProps>

export const makeDateId = (date: Date) => format(date, 'yyyy-MM-dd')

export type DateDataPayload = Prisma.DateDataGetPayload<Prisma.DateDataArgs> & {
  marks: Mark[]
}

export const composeDateData = (date: Date, marks: Mark[]) => {
  const Y = date.getFullYear()
  const m = date.getMonth() as MonthIndex

  const dateProps: DateDataPayload = {
    id: makeDateId(date),
    date: getDate(date),
    dayName: getDayName(getDay(date)),
    dayIndex: getDay(date),
    weekIndex: getWeek(date, {
      weekStartsOn: 0,
    }),
    monthId: makeMonthId(Y, m),
    monthIndex: m,
    yearId: Y,
    marks: marks,
    updatedAt: new Date(),
  }

  return dateProps
}

export const createDateData = (
  date: Date,
  optionals?: Partial<Prisma.DateDataUncheckedCreateInput>
) => {
  const Y = date.getFullYear()
  const m = date.getMonth() as MonthIndex
  const dateProps: Prisma.DateDataUncheckedCreateWithoutMonthInput = {
    id: makeDateId(date),
    date: getDate(date),
    dayName: getDayName(getDay(date)),
    dayIndex: getDay(date),
    weekIndex: getWeek(date, {
      weekStartsOn: 0,
    }),
    monthIndex: m,
    yearId: Y,
    ...optionals,
  }

  return dateProps
}
