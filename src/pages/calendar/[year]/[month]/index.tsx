import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import Head from 'next/head'

import { MonthCalendar, StaticMonth } from '@/components/calendar/month'

import {
  getDateRangeOffsets,
  getMonthName,
  getMonthNames,
} from '@/utils/datetime'
import { makeDateId } from '@/server/db/models/date'
import { getDateQueryHandler } from '@/utils/query'
import { getCalendar } from '@/utils/calendar'
import Link from 'next/link'
import { getRedisArray } from '@/server/redis/client'
import { createDateData } from '@/server/redis/calendar'

type CalendarProps = InferGetStaticPropsType<typeof getStaticProps>

const Calendar: NextPage<CalendarProps> = ({ month, year }) => {
  const title = `Alhasandev Calendar - ${year}/${month.index + 1}`
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="My internal calendar project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container max-w-screen-xl mx-auto min-h-screen p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-4xl leading-normal font-extrabold text-gray-700">
            Alhasandev <span className="text-purple-300">Calendar</span>{' '}
            {month.name} {year}
          </h1>
          <Link href={`/calendar/${month.year}`}>
            <a className="border px-2 py-1 rounded-md inline-block">Back</a>
          </Link>
        </div>
        <div className="p-4 border rounded-md">
          <MonthCalendar key={month.id} data={month} />
        </div>
      </main>
    </>
  )
}

export default Calendar

export const getStaticProps: GetStaticProps<
  {
    month: StaticMonth
    year: number
  },
  {
    year: string
    month: string
  }
> = async ({ params }) => {
  const { year, month } = getDateQueryHandler(params || {}, {
    year: new Date().getFullYear(),
    month: 0,
  })

  const data = await getCalendar({ year, month: month - 1 })

  if (!data) throw new Error('Calendar Not Found')

  const date = new Date(year, month - 1)
  getDateRangeOffsets(date, ({ _year, _month, _date, _type }) => {
    const offsetDate = new Date(_year, _month, _date)
    const date = createDateData(offsetDate, [
      {
        id: '',
        dateId: makeDateId(offsetDate),
        type: _type,
        summary: getMonthName(_month),
        description: '',
        year: _year,
        month: _month,
      },
    ])

    if (_type === 'prev') {
      data.offsets.prev.push(date)
    }

    if (_type === 'next') {
      data.offsets.next.push(date)
    }
  })

  return {
    props: {
      month: data,
      year: year,
    },
  }
}

type StaticPath = {
  year: string
  month: string
}

export const getStaticPaths: GetStaticPaths<StaticPath> = async () => {
  const years = await getRedisArray('years')

  const paths = years.reduce((params, year) => {
    getMonthNames((_, index) => {
      params.push({
        params: {
          year: year,
          month: `${index + 1}`,
        },
      })
    })

    return params
  }, [] as { params: StaticPath }[])

  return {
    paths: paths,
    fallback: false,
  }
}
