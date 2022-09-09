import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'

import { prisma } from '@/server/db/client'

import { MonthProps } from '@/utils/get-months2'
import { Prisma } from '@prisma/client'

type CalendarProps = InferGetStaticPropsType<typeof getStaticProps>

const Calendar: NextPage<CalendarProps> = ({ months }) => {
  return (
    <>
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
    months: Prisma.MonthGetPayload<true>[]
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
  })

  return {
    props: {
      months,
    },
  }
}

export const getStaticPaths: GetStaticPaths<{ year: string }> = async () => {
  return {
    paths: [{ params: { year: '2021' } }, { params: { year: '2022' } }],
    fallback: false,
  }
}
