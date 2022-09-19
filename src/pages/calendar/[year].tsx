import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import Head from 'next/head'

import { MonthCalendar, StaticMonth } from '@/components/calendar/month'
import { getDateRangeOffsets, getMonthName } from '@/utils/datetime'
import { makeDateId } from '@/server/db/models/date'
import { getDateQueryHandler } from '@/utils/query'
import { getCalendar } from '@/utils/calendar'
import Link from 'next/link'
import { createDateData } from '@/server/redis/calendar'
import { getRedisArray } from '@/server/redis/client'

type CalendarProps = InferGetStaticPropsType<typeof getStaticProps>

const Calendar: NextPage<CalendarProps> = ({ months, year }) => {
  const title = `Alhasandev Calendar - ${year}`
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="My internal calendar project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container max-w-screen-xl mx-auto min-h-screen p-4">
        <h1 className="text-2xl md:text-4xl leading-normal font-extrabold text-gray-700">
          Alhasandev <span className="text-purple-300">Calendar</span> {year}
        </h1>
        <section className="py-2 grid md:grid-cols-2 lg:grid-cols-3 gap-2">
          {months.map((month) => (
            <div key={month.id} className="border p-4 rounded-md">
              <h2 className="mb-4">
                <Link href={`${month.year}/${month.index + 1}`}>
                  <a className="px-4 py-1 rounded-md inline-block transition-colors bg-purple-300 text-slate-900 hover:bg-purple-700 hover:text-purple-50">
                    {month.name}
                  </a>
                </Link>
              </h2>
              <MonthCalendar data={month} />
            </div>
          ))}
        </section>
      </main>
    </>
  )
}

export default Calendar

export const getStaticProps: GetStaticProps<
  {
    months: StaticMonth[]
    year: number
  },
  {
    year: string
  }
> = async ({ params }) => {
  const { year } = getDateQueryHandler(params || {}, {
    year: new Date().getFullYear(),
  })

  const calendar = await getCalendar({ year })

  const monthsWithOffsets = calendar.months.map((month) => {
    const date = new Date(year, month.index)
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
        month.offsets.prev.push(date)
      }

      if (_type === 'next') {
        month.offsets.next.push(date)
      }
    })

    return month
  })

  return {
    props: {
      months: monthsWithOffsets,
      year: year,
    },
    revalidate: 60,
  }
}

export const getStaticPaths: GetStaticPaths<{ year: string }> = async () => {
  const years = await getRedisArray('years')

  return {
    paths: years.map((id) => ({ params: { year: `${id}` } })),
    fallback: 'blocking',
  }
}
