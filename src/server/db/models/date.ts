import { getDayName, MonthIndex } from '@/utils/datetime'
import { Prisma } from '@prisma/client'
import { format, getDay, getWeek } from 'date-fns'

export type DateProps = Prisma.DateDataUncheckedCreateWithoutMonthInput
export type DatesProps = Prisma.DateDataCreateNestedManyWithoutMonthInput

export type MarkedDate = DateProps
export type MarkedDates = Record<number, DateProps>

export const makeDateId = (date: Date) => format(date, 'yyyy-MM-dd')

export const createDateData = (
  date: Date,
  optionals?: Partial<Prisma.DateDataUncheckedCreateInput>
) => {
  const Y = date.getFullYear()
  const m = date.getMonth() as MonthIndex
  const dateProps: Prisma.DateDataUncheckedCreateWithoutMonthInput = {
    id: makeDateId(date),
    date: date.getDate(),
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
