import fetchHolidays, { Holiday, HolidaysAPI } from '@/utils/fetch-holidays'
import {
  startOfWeek,
  getDate,
  getDay,
  getDaysInMonth,
  getWeek,
  getWeeksInMonth,
  lastDayOfMonth,
  getMonth,
} from 'date-fns'

import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import Head from 'next/head'
import Image from 'next/image'

const DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  "Jum'at",
  'Sabtu',
] as const

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const

type MonthIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

function range<T>(
  options: { from?: number; step?: number; to: number },
  callback: (_n: number) => T = (n) => n as unknown as T
) {
  const { from = 0, step = 1, to } = options

  if (!to) {
    throw Error('"to" must be specified')
  }

  if (to <= from) {
    throw Error(`"to (${to})" is lesser than or equal to "from (${from})"`)
  }

  const ranges = Array.from(
    { length: Math.ceil((to - from + 1) / step) },
    (_, i) => callback(i * step + from)
  ) as T[]

  return ranges
}

type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

type MonthName = typeof MONTH_NAMES[MonthIndex]
type DayName = typeof DAY_NAMES[DayIndex]

type DateMark = {
  type: MarkType
  description: string
}

type MarkType =
  | 'libur-mingguan'
  | 'libur-nasional'
  | 'cuti-bersama'
  | 'app-event'
  | 'prev-offset'
  | 'next-offset'

type DateProps = {
  rawDate: Date | string
  date: number
  day: {
    name: DayName
    order: number
  }
  week: number
  marks?: DateMark[]
}

type MarkedDate = DateMark & DateProps

type MonthProps = {
  index: MonthIndex
  name: MonthName
  daysCount: number
  weeksCount: number
  markedDates: Record<number, MarkedDate[]> | null
}

const getDayName = (dayOfWeek: DayIndex) => {
  return DAY_NAMES[dayOfWeek]
}

const getMonthName = (monthIndex: MonthIndex) => {
  return MONTH_NAMES[monthIndex]
}

const makeDateProps = (date: Date, marks?: DateMark[]) => {
  const dateProps: DateProps = {
    rawDate: date,
    date: getDate(date),
    day: {
      name: getDayName(getDay(date)),
      order: getDay(date),
    },
    week: getWeek(date),
    marks: marks,
  }

  return dateProps
}

const makeMarkedDate = (date: Date, mark: DateMark) => {
  const markedDate: MarkedDate = {
    rawDate: date.toDateString(),
    date: getDate(date),
    day: {
      name: getDayName(getDay(date)),
      order: getDay(date),
    },
    week: getWeek(date),
    type: mark.type,
    description: mark.description,
  }

  return markedDate
}

const getDateRange = (year: number, month: MonthProps) => {
  const firstDate = new Date(year, month.index, 1)
  const dayOfWeek = getDay(firstDate)
  const lastDate = lastDayOfMonth(firstDate)
  const lastDay = getDay(lastDate)
  const marks = month.markedDates

  const formatter = (year: number, m: MonthIndex, n: number) => {
    return makeDateProps(new Date(year, m, n), marks?.[n])
  }

  const dateRange: DateProps[] = range(
    {
      from: 1,
      to: month.daysCount,
    },
    (n) => formatter(year, month.index, n)
  )

  let preOffset: DateProps[] = []

  if (dayOfWeek !== 0) {
    const firstDateOfWeek = getDate(startOfWeek(firstDate))

    const lastDateOfWeek = firstDateOfWeek + dayOfWeek - 1
    preOffset = range({ from: firstDateOfWeek, to: lastDateOfWeek }, (n) =>
      makeDateProps(new Date(year, month.index, n), [
        {
          type: 'prev-offset',
          description: 'Bulan sebelumnya',
        },
      ])
    )
  }

  let postOffset: DateProps[] = []
  if (lastDay < 6) {
    postOffset = range({ from: 1, to: 6 - lastDay }, (n) =>
      makeDateProps(new Date(year, month.index, n), [
        {
          type: 'next-offset',
          description: 'Bulan selanjutnya',
        },
      ])
    )
  }

  return [...preOffset, ...dateRange, ...postOffset]
}

type CalendarProps = InferGetStaticPropsType<typeof getStaticProps>

const Calendar: NextPage<CalendarProps> = ({
  holidays,
  months,
  formattedHoliday,
}) => {
  return (
    <>
      {holidays.map((holiday) => (
        <div
          key={holiday.holiday_date + holiday.holiday_name}
          className={`${holiday.is_national_holiday ? 'text-red-500' : ''}`}
        >
          {holiday.holiday_date} {holiday.holiday_name}
        </div>
      ))}
      <pre>{JSON.stringify(months, null, 2)}</pre>
    </>
  )

  // return (
  //   <>
  //     <Head>
  //       <title>Alhasandev Calendar</title>
  //       <meta name="description" content="My internal calendar project" />
  //       <link rel="icon" href="/favicon.ico" />
  //     </Head>

  //     <main className="container max-w-screen-xl mx-auto min-h-screen p-4">
  //       <h1 className="text-2xl md:text-4xl leading-normal font-extrabold text-gray-700">
  //         Alhasandev <span className="text-purple-300">Calendar</span>
  //       </h1>
  //       <article className="px-4 py-2 grid md:grid-cols-2 lg:grid-cols-3">
  //         {thisYear.map((month) => (
  //           <section key={month.name} className="border">
  //             <header className="px-4 py-2">{month.name}</header>
  //             <div className="grid grid-cols-7 text-sm text-center px-4">
  //               {DAY_NAMES.map((dayName) => (
  //                 <span className="border py-2" key={dayName}>
  //                   {dayName}
  //                 </span>
  //               ))}
  //             </div>
  //             <div className="p-4 grid grid-cols-7 box-border gap-px text-center text-sm">
  //               {getDateRange(year, month).map((n, i) => {
  //                 const isOffset =
  //                   n.marks?.[0]?.type === 'prev-offset' ||
  //                   n.marks?.[0]?.type === 'next-offset'

  //                 const isHoliday =
  //                   n.marks?.[0]?.type === 'libur-nasional' ||
  //                   n.marks?.[0]?.type === 'libur-mingguan'
  //                 return (
  //                   <span
  //                     className={`shadow-[0_0_0_1px_rgb(100,116,139)] py-2 ${
  //                       isOffset ? 'text-slate-500' : 'text-slate-900'
  //                     } ${isHoliday ? 'text-red-600 bg-red-50' : ''}`}
  //                     key={String(i)}
  //                   >
  //                     {n.date}
  //                   </span>
  //                 )
  //               })}
  //             </div>
  //           </section>
  //         ))}
  //       </article>
  //     </main>
  //   </>
  // )
}

export default Calendar

export const getStaticProps: GetStaticProps<
  {
    months: MonthProps[]
    holidays: HolidaysAPI
    monthlyHolidays: Record<string, MonthProps>
    formattedHoliday: Record<string, Record<number, MarkedDate[]>>
  },
  {
    year: string
  }
> = async ({ params }) => {
  if (!params?.year) return { notFound: true }

  const holidaysData = await fetchHolidays({
    year: params.year,
  })

  let formattedHolidays: Record<string, Record<number, MarkedDate[]>> = {}
  holidaysData.map((holiday) => {
    const date = new Date(holiday.holiday_date)
    const m = getMonth(date)
    const d = date.getDate()
    if (!formattedHolidays?.[m]) {
      formattedHolidays = {
        ...formattedHolidays,
        [m]: {
          [d]: [
            makeMarkedDate(date, {
              type: 'libur-nasional',
              description: holiday.holiday_name,
            }),
          ],
        },
      }
    } else {
      if (!formattedHolidays[m]?.[d]) {
        formattedHolidays[m] = {
          ...formattedHolidays[m],
          [d]: [
            makeMarkedDate(date, {
              type: 'libur-nasional',
              description: holiday.holiday_name,
            }),
          ],
        }
      } else {
        formattedHolidays[m]?.[d]?.push(
          makeMarkedDate(date, {
            type: 'libur-nasional',
            description: holiday.holiday_name,
          })
        )
      }
    }
    return holiday
  })

  const months: MonthProps[] = MONTH_NAMES.map((monthName, n) => {
    const firstDate = new Date(Number(params.year), n + 1, 1)
    const monthIndex = n as MonthIndex

    const month: MonthProps = {
      index: monthIndex,
      name: monthName,
      daysCount: getDaysInMonth(firstDate),
      weeksCount: getWeeksInMonth(firstDate),
      markedDates: formattedHolidays[monthIndex] || null,
    }

    return month
  })

  const monthlyHolidays: Record<string, MonthProps> = {}

  return {
    props: {
      holidays: holidaysData,
      monthlyHolidays,
      months,
      formattedHoliday: formattedHolidays,
    },
  }
}

export const getStaticPaths: GetStaticPaths<{ year: string }> = async () => {
  return {
    paths: [{ params: { year: '2021' } }, { params: { year: '2022' } }],
    fallback: false,
  }
}
