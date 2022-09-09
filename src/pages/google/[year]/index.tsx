import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import Head from 'next/head'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/server/db/client'
import { getDaysNames } from '@/utils/datetime'

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
        <div className="bg-slate-200 p-px">
          <article className="grid md:grid-cols-2 lg:grid-cols-3 gap-px">
            {months.map((month) => (
              <section key={month.name} className="bg-white">
                <header className="px-4 py-2">{month.name}</header>
                <div className="grid grid-cols-7 text-sm text-center px-4">
                  {getDaysNames((dayName) => (
                    <span className="border py-2" key={dayName}>
                      {dayName}
                    </span>
                  ))}
                </div>
                <div className="p-4 grid grid-cols-7 box-border gap-px text-center text-sm">
                  {month.dates.map((date, i) => {
                    const isOffset =
                      date.marks?.[0]?.type === 'prev-offset' ||
                      date.marks?.[0]?.type === 'next-offset'

                    const isHoliday =
                      date.marks?.[0]?.type === 'default' ||
                      date.marks?.[0]?.type === 'holiday'

                    return (
                      <span
                        className={`shadow-[0_0_0_1px_rgb(100,116,139)] py-2 ${
                          isOffset ? 'text-slate-500' : 'text-slate-900'
                        } ${isHoliday ? 'text-red-600 bg-red-50' : ''}`}
                        key={String(i)}
                      >
                        {date.date}
                      </span>
                    )
                  })}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>
    </>
  )
}

export default Calendar

const monthArgs = {
  include: {
    dates: {
      include: {
        marks: true,
      },
    },
  },
}

type MonthArgs = typeof monthArgs

export const getStaticProps: GetStaticProps<
  {
    months: Prisma.MonthGetPayload<MonthArgs>[]
  },
  {
    year: string
  }
> = async ({ params }) => {
  if (!params?.year) return { notFound: true }

  const year = Number(params.year)

  const months = await prisma.month.findMany({
    where: {
      yearId: year,
    },
    include: monthArgs.include,
  })

  return {
    props: {
      months,
    },
  }
}

export const getStaticPaths: GetStaticPaths<{ year: string }> = async () => {
  return {
    paths: [
      { params: { year: '2021' } },
      { params: { year: '2022' } },
      { params: { year: '2023' } },
    ],
    fallback: false,
  }
}
