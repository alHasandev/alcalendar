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
import { monthArgs } from '@/server/db/models/month'
import { getCalendar } from '@/utils/calendar'

type CalendarProps = InferGetStaticPropsType<typeof getStaticProps>

const Calendar: NextPage<CalendarProps> = ({ months, year }) => {
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
        <div className="py-2 grid md:grid-cols-2 lg:grid-cols-3 gap-2">
          {months.map((month) => (
            <MonthCalendar key={month.id} data={month} />
          ))}
        </div>
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

  const { months } = await getCalendar({ year })

  const monthsWithOffsets = months.map((month) => {
    const date = new Date(month.yearId, month.index)
    const { prev, next } = getDateRangeOffsets(
      date,
      ({ _year, _month, _date, _type }) => {
        const offsetDate = new Date(_year, _month, _date)
        return composeDateData(offsetDate, [
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
      }
    )

    return {
      ...month,
      prevOffsets: prev,
      nextOffsets: next,
    }
  })

  return {
    props: {
      months: serializeObject(monthsWithOffsets),
      year: year,
    },
    revalidate: 60,
  }
}

export const getStaticPaths: GetStaticPaths<{ year: string }> = async () => {
  const years = await prisma.year.findMany({
    select: {
      id: true,
    },
  })

  return {
    paths: years.map(({ id }) => ({ params: { year: `${id}` } })),
    fallback: 'blocking',
  }
}
