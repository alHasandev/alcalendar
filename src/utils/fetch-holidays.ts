import { env } from '@/env/server.mjs'

export type HolidaysAPI = Holiday[]

export interface Holiday {
  holiday_date: string
  holiday_name: string
  is_national_holiday: boolean
}

type MonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

type FetchHolidaysParams = {
  year?: string
  month?: MonthIndex
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
  const queryString = paramsToQueryString(params)

  console.log('api url', env.HOLIDAYS_API_URL + queryString)

  const res = await fetch(env.HOLIDAYS_API_URL + queryString)
  return res.json() as Promise<HolidaysAPI>
}

export default fetchHolidays
