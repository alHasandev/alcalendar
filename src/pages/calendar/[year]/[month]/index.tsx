import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import Head from 'next/head'

import { MonthCalendar, StaticMonth } from '@/components/calendar/month'
import { prisma } from '@/server/db/client'
import { getDateRangeOffsets, getMonthName } from '@/utils/datetime'
import { serializeObject } from '@/utils/object'
import { composeDateData, makeDateId } from '@/server/db/models/date'
import { getDateQueryHandler } from '@/utils/query'
import { format } from 'date-fns'
import { getCalendar } from '@/utils/calendar'
import Link from 'next/link'

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
          <Link href={`/calendar/${month.yearId}`}>
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

  const data = await getCalendar({ year, month })

  if (!data) throw new Error('Calendar Not Found')
  // console.log('🚀 ~ file: index.tsx ~ line 69 ~ >= ~ data', data)

  const date = new Date(year, month)
  const { prev, next } = getDateRangeOffsets(
    date,
    ({ _year, _month, _date, _type }) => {
      const offsetDate = new Date(_year, _month, _date) as Date
      return composeDateData(offsetDate, [
        {
          id: '',
          dateId: makeDateId(offsetDate),
          type: _type,
          summary: getMonthName(_month),
          description: format(offsetDate, 'yyyy-MM-dd'),
          year: _year,
          month: _month,
        },
      ])
    }
  )

  const monthData = serializeObject({
    ...data,
    prevOffsets: prev,
    nextOffsets: next,
  })

  console.log('🚀 ~ file: index.tsx ~ line 95 ~ >= ~ monthData', monthData)

  return {
    props: {
      month: monthData,
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
