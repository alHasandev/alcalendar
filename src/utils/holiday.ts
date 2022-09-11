import { DateMark } from '@/server/db/models/mark'
import { MonthIndex } from './datetime'
import fetchHolidays, { holidaysReducer } from './fetch-holidays'

export type IndexedMarks = Record<number, DateMark[]>
export type MarksReducer<T> = (
  _prev: Record<number, IndexedMarks>,
  _curr: T,
  _index: number,
  _array: T[]
) => Record<number, IndexedMarks>

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

export const getHolidaysObj = async (year: number) => {
  const holidaysData = await fetchHolidays({
    year: year,
  })

  const holidays: Record<MonthIndex, IndexedMarks> = holidaysObjConverter(
    holidaysData.items,
    holidaysReducer
  )

  return holidays
}
