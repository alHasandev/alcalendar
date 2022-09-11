import { getMonthNames, MonthIndex } from './datetime'

import {
  createMonthWithoutYearInput,
  MonthProps,
} from '@/server/db/models/month'
import { IndexedMarks } from './holiday'
import { createDateRange } from './create-dates'

export type MonthMarksMap = Map<MonthIndex, IndexedMarks>

export async function createMonthsData(
  year: number,
  monthMarksMap?: MonthMarksMap
) {
  const monthMarks: MonthMarksMap = monthMarksMap || new Map()

  const months: MonthProps[] = getMonthNames((name, index) =>
    createMonthWithoutYearInput(
      year,
      { name, index },
      {
        dates: {
          create: createDateRange(year, index, monthMarks.get(index)),
        },
      }
    )
  )

  return months
}
