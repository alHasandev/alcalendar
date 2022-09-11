import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import { Prisma } from '@prisma/client'

import { prisma } from '@/server/db/client'
import {
  getDateRangeOffsets,
  getDayNames,
  getMonthName,
} from '@/utils/datetime'
import Head from 'next/head'
import { serializeObject } from '@/utils/object'
import { createDateData, DateProps } from '@/server/db/models/date'
import { createDateMark } from '@/server/db/models/mark'

type CalendarProps = InferGetStaticPropsType<typeof getStaticProps>

const Calendar: NextPage<CalendarProps> = ({ months }) => {
  return (
    <>
      <Head>
        <title>Alhasandev Calendar</title>
        <meta name="description" content="My internal calendar project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container max-w-screen-xl mx-auto min-h-screen p-4">
        <h1 className="text-2xl md:text-4xl leading-normal font-extrabold text-gray-700">
          Alhasandev <span className="text-purple-300">Calendar</span>
        </h1>
        <article className="px-4 py-2 grid md:grid-cols-2 lg:grid-cols-3">
          {months.map((month) => (
            <section key={month.name} className="border">
              <header className="px-4 py-2">{month.name}</header>
              <div className="grid grid-cols-7 text-sm text-center px-4">
                {getDayNames((dayName) => (
                  <span className="border py-2" key={dayName}>
                    {dayName}
                  </span>
                ))}
              </div>
              <div className="p-4 grid grid-cols-7 box-border gap-px text-center text-sm">
                {month.prevOffsets?.map((date) => {
                  return (
                    <span
                      className={`shadow-[0_0_0_1px_rgb(100,116,139)] py-2 text-slate-500`}
                      key={date.id}
                    >
                      {date.date}
                    </span>
                  )
                })}
                {month.dates.map((date) => {
                  const isHoliday =
                    date.marks?.[0]?.type === 'default' ||
                    date.marks?.[0]?.type === 'holiday'
                  return (
                    <span
                      className={`shadow-[0_0_0_1px_rgb(100,116,139)] py-2 text-slate-900 ${
                        isHoliday ? 'text-red-600 bg-red-50' : ''
                      }`}
                      key={date.id}
                    >
                      {date.date}
                    </span>
                  )
                })}
                {month.nextOffsets?.map((date) => {
                  return (
                    <span
                      className={`shadow-[0_0_0_1px_rgb(100,116,139)] py-2 text-slate-500`}
                      key={date.id}
                    >
                      {date.date}
                    </span>
                  )
                })}
              </div>
            </section>
          ))}
        </article>
      </main>
    </>
  )
}

export default Calendar

const monthArgs = {
  select: {},
  include: {
    dates: {
      include: {
        marks: true,
      },
    },
  },
}

type MonthArgs = typeof monthArgs

type MonthOffsets = {
  prevOffsets?: DateProps[]
  nextOffsets?: DateProps[]
}

type StaticMonths = (Prisma.MonthGetPayload<MonthArgs> & MonthOffsets)[]

export const getStaticProps: GetStaticProps<
  {
    months: StaticMonths
  },
  {
    year: string
  }
> = async ({ params }) => {
  const year = Number(params?.year)

  if (isNaN(year))
    throw new TypeError('Year query not valid (YYYY) of numeric!')

  const months = await prisma.month.findMany({
    where: {
      yearId: year,
    },
    include: monthArgs.include,
  })

  const monthsWithOffsets = months.map((month) => {
    const date = new Date(month.yearId, month.index)
    const { prev, next } = getDateRangeOffsets(
      date,
      ({ _year, _month, _date, _type }) => {
        const offsetDate = new Date(_year, _month, _date)
        return createDateData(offsetDate, {
          marks: {
            create: createDateMark({
              type: `${_type}-month`,
              summary: getMonthName(_month),
            }),
          },
        })
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
    },
  }
}

export const getStaticPaths: GetStaticPaths<{ year: string }> = async () => {
  return {
    paths: [{ params: { year: '2021' } }, { params: { year: '2022' } }],
    fallback: false,
  }
}
