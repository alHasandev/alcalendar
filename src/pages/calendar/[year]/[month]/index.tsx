import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import Head from 'next/head'

import { MonthCalendar, StaticMonth } from '@/components/calendar/month'
import { prisma } from '@/server/db/client'
import { getDateRangeOffsets, getMonthName, MonthIndex } from '@/utils/datetime'
import { serializeObject } from '@/utils/object'
import { composeDateData } from '@/server/db/models/date'
import { getDateQueryHandler } from '@/utils/query'
import { makeMonthId, monthArgs } from '@/server/db/models/month'
import { format } from 'date-fns'

type CalendarProps = InferGetStaticPropsType<typeof getStaticProps>

const Calendar: NextPage<CalendarProps> = ({ month, year }) => {
  return (
    <>
      <Head>
        <title>Alhasandev Calendar {year}</title>
        <meta name="description" content="My internal calendar project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container max-w-screen-xl mx-auto min-h-screen p-4">
        <h1 className="text-2xl md:text-4xl leading-normal font-extrabold text-gray-700">
          Alhasandev <span className="text-purple-300">Calendar</span> {year}
        </h1>
        <div className="py-2">
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

  const data = await prisma.month.findUnique({
    where: {
      id: makeMonthId(year, month as MonthIndex),
    },
    include: monthArgs.include,
  })

  if (!data) throw new Error('Calendar Not Found')

  const date = new Date(year, data.index)
  const { prev, next } = getDateRangeOffsets(
    date,
    ({ _year, _month, _date, _type }) => {
      const offsetDate = new Date(_year, _month, _date) as Date
      return composeDateData(offsetDate, [
        {
          type: _type,
          summary: getMonthName(_month),
          description: format(offsetDate, 'yyyy-MM-dd'),
        },
      ])
    }
  )

  return {
    props: {
      month: serializeObject({
        ...data,
        prevOffsets: prev,
        nextOffsets: next,
      }),
      year: year,
    },
  }
}

type StaticPath = {
  year: string
  month: string
}

export const getStaticPaths: GetStaticPaths<StaticPath> = async () => {
  const months = await prisma.month.findMany({
    select: {
      yearId: true,
      index: true,
    },
  })

  return {
    paths: months.map(({ yearId, index }) => ({
      params: { year: `${yearId}`, month: `${index}` },
    })),
    fallback: false,
  }
}
