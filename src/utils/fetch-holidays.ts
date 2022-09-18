import { env } from '@/env/server.mjs'
import { createDateMark, DateMark } from '@/server/db/models/mark'
import {
  endOfMonth,
  formatRFC3339,
  getDate,
  getMonth,
  setDefaultOptions,
} from 'date-fns'
import { id } from 'date-fns/locale'
import { MonthIndex } from './datetime'
import { MarksReducer } from './holiday'

// Default options for date-fns
setDefaultOptions({
  locale: id,
})

export type HolidaysAPI = {
  kind: 'calendar#events'
  etag: string
  summary: string
  updated: string
  timeZone: string
  accessRole: string
  defaultReminders: DefaultReminder[]
  items: Holiday[]
}

export interface DefaultReminder {
  method: string
  minutes: number
}

export interface Holiday {
  kind: 'calendar#event'
  etag: string
  id: string
  status: string
  htmlLink: string
  created: string
  updated: string
  summary: string
  description: string
  creator: EventCreator
  organizer: EventOrganizer
  start: EventStart
  end: EventEnd
  transparency: string
  visibility: string
  iCalUID: string
  sequence: number
  eventType: string
}

export interface EventCreator {
  email: string
  displayName: string
  self: boolean
}

export interface EventOrganizer {
  email: string
  displayName: string
  self: boolean
}

export interface EventStart {
  date: string
}

export interface EventEnd {
  date: string
}

type FetchHolidaysParams = {
  year: number
  month?: number
  date?: number
}

export function dateConstraintToEventsTimeRange({
  year,
  month,
  date,
}: FetchHolidaysParams): {
  timeMin: string
  timeMax: string
} {
  const monthMin = month || 0
  const dateMin = date
    ? new Date(year, monthMin, date)
    : new Date(year, monthMin)

  const monthMax = month !== undefined ? month : 11
  const dateMax = date
    ? new Date(year, monthMax, date + 1)
    : endOfMonth(new Date(year, monthMax))

  return {
    timeMin: encodeURIComponent(formatRFC3339(dateMin)),
    timeMax: encodeURIComponent(formatRFC3339(dateMax)),
  }
}

export const paramsToQueryString = (
  params: Record<string, string | number | boolean>
) => {
  const queries = Object.keys(params).map(
    (param) => `${param}=${params[param]}`
  )
  const queryString = queries.join('&')

  return `?${queryString}`
}

type FetchHolidays = (_params: FetchHolidaysParams) => Promise<HolidaysAPI>

export const fetchHolidays: FetchHolidays = async (params) => {
  const defaultParams = {
    orderBy: 'startTime',
    singleEvents: true,
    key: env.HOLIDAYS_API_KEY,
  }

  const queryString = paramsToQueryString({
    ...defaultParams,
    ...dateConstraintToEventsTimeRange(params),
  })

  const res = await fetch(env.GOGGLE_CALENDAR_EVENT_LIST + queryString)
  return res.json() as Promise<HolidaysAPI>
}

export const holidaysReducer: MarksReducer<Holiday> = (prev, curr) => {
  const date = new Date(curr.start.date)
  const m = getMonth(date) as MonthIndex
  const d = getDate(date)

  const mark: DateMark = createDateMark(
    {
      type: curr.eventType,
      summary: curr.summary,
      description: curr.description,
    },
    {
      id: curr.id,
    }
  )

  if (!prev?.[m]?.[d]) {
    prev[m] = {
      ...prev[m],
      [d]: [mark],
    }
  } else {
    prev[m]?.[d]?.push(mark)
  }

  return prev
}

export default fetchHolidays
