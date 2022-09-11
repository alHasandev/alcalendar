import { createDateData } from '@/server/db/models/date'
import { DateMark } from '@/server/db/models/mark'
import { getDateRange, MonthIndex } from './datetime'

export const createDateRange = (
  year: number,
  monthIndex: MonthIndex,
  markeds?: Record<number, DateMark[]>
) =>
  getDateRange(year, monthIndex, ({ _year, _month, _date }) => {
    return createDateData(new Date(_year, _month, _date), {
      marks: {
        create: markeds?.[_date],
      },
    })
  })
