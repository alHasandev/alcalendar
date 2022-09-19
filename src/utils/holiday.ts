import { makeDateId } from '@/server/db/models/date'
import { DateMark } from '@/server/db/models/mark'
import { MonthIndex } from './datetime'
import fetchHolidays, { Holiday, holidaysReducer } from './fetch-holidays'

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

export const apiDataItemsToEvents = (items: Holiday[]) => {
  return items.map((data) => {
    const date: Date = new Date(data.start.date)
    const dateId = makeDateId(date)
    return {
      id: data.id,
      dateId: dateId,
      type: data.eventType,
      summary: data.summary,
      description: data.description,
      authorId: data.creator.email,
      groupId: data.organizer.email,
      year: date.getFullYear(),
      month: date.getMonth(),
    }
  })
}
