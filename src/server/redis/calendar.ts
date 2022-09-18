import { getDayName, MonthIndex, MonthName } from '@/utils/datetime'
import {
  getDate,
  getDay,
  getDaysInMonth,
  getWeek,
  getWeeksInMonth,
} from 'date-fns'
import { RedisJsonData } from 'redis-om'
import { makeDateId } from '../db/models/date'
import { makeMonthId } from '../db/models/month'
import { getRedisJSON, pushRedisArray, setRedisJSON } from './client'

export interface Calendar extends RedisJsonData {
  id: string
  year: number
  months: Month[]
}

export interface Month {
  id: string
  year: number
  index: number
  name: string
  weekIndex: number
  weeksCount: number
  daysCount: number
  offsets: {
    prev: DateData[]
    next: DateData[]
  }
  dates: DateData[]
}

export interface DateData {
  id: string
  month: number
  year: number
  index: number
  name: string
  order: number
  weekIndex: number
  events: Event[]
}

export interface User {
  id: string
  name: string
  email: string
  image?: string
}

export interface Group {
  id: string
  name: string
  description: string
  ownerId: User['id']
}

export interface EventType {
  id: string
  name: string
  description: string
}

export interface Event {
  id: string
  dateId: DateData['id']
  groupId?: Group['id']
  authorId?: User['id']
  type: EventType['id']
  summary: string
  description: string | null
  year: number
  month: number
  time?: {
    start: number
    end: number
  }
}

export const model = 'calendar'

export const createDateData = (date: Date, events: Event[]) => {
  const Y = date.getFullYear()
  const m = date.getMonth() as MonthIndex

  const order = getDay(date)

  const dateProps: DateData = {
    id: makeDateId(date),
    index: getDate(date),
    name: getDayName(order),
    order: order,
    weekIndex: getWeek(date, {
      weekStartsOn: 0,
    }),
    month: m,
    year: Y,
    events: events,
  }

  return dateProps
}

export const createMonth = (
  year: number,
  month: {
    index: MonthIndex
    name: MonthName
  },
  dates: DateData[]
) => {
  const date = new Date(year, month.index, 1)

  const data: Month = {
    id: makeMonthId(year, month.index),
    year: year,
    index: month.index,
    name: month.name,
    daysCount: getDaysInMonth(date),
    weeksCount: getWeeksInMonth(date),
    weekIndex: getWeek(date),
    offsets: {
      prev: [],
      next: [],
    },
    dates: dates,
  }

  return data
}

export const pushEventToStaticData = (
  events: Event[],
  dataset: (_m: number, _n: number) => Event[] | undefined
) => {
  events.map((event) => {
    const date = new Date(event.dateId)
    const d = getDate(date)
    const m = date.getMonth()

    dataset(m, d - 1)?.push(event)
  })
}

export const saveCalendar = async (id: string, calendar: Calendar) => {
  await setRedisJSON(model, id, calendar)
  await pushRedisArray('years', calendar.year)

  return calendar
}

export const fetchCalendar = async (id: string) => {
  const calendar: Calendar | null = await getRedisJSON(model, id)

  return calendar
}
