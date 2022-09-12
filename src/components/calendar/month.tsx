import { DateDataPayload } from '@/server/db/models/date'
import { MonthArgs } from '@/server/db/models/month'
import { getDayNames } from '@/utils/datetime'
import { Prisma } from '@prisma/client'

type MonthOffsets = {
  prevOffsets?: DateDataPayload[]
  nextOffsets?: DateDataPayload[]
}

export type StaticMonth = Prisma.MonthGetPayload<MonthArgs> & MonthOffsets

export type MonthProps = {
  data: StaticMonth
}

export function MonthCalendar({ data }: MonthProps) {
  return (
    <article key={data.name} className="border">
      <h2 className="px-4 py-2">{data.name}</h2>
      <header className="grid grid-cols-7 text-sm text-center px-4">
        {getDayNames((dayName) => (
          <div
            className="border py-2 px-1 text-ellipsis overflow-hidden"
            key={dayName}
          >
            {dayName}
          </div>
        ))}
      </header>
      <section className="p-4 grid grid-cols-7 box-border gap-px text-center text-sm">
        {data.prevOffsets?.map((date) => {
          return (
            <span
              className={`shadow-[0_0_0_1px_rgb(100,116,139)] py-2 text-slate-500 cursor-pointer`}
              key={date.id}
              title={`${date.marks.at(0)?.summary} sebelumnya`}
            >
              {date.date}
            </span>
          )
        })}
        {data.dates.map((date) => {
          const isHoliday =
            date.marks?.[0]?.type === 'default' ||
            date.marks?.[0]?.type === 'holiday'
          return (
            <span
              className={`shadow-[0_0_0_1px_rgb(100,116,139)] py-2 text-slate-900 cursor-pointer ${
                isHoliday ? 'text-red-600 bg-red-50' : ''
              }`}
              key={date.id}
              title={date.marks.at(0)?.summary}
            >
              {date.date}
            </span>
          )
        })}
        {data.nextOffsets?.map((date) => {
          return (
            <span
              className={`shadow-[0_0_0_1px_rgb(100,116,139)] py-2 text-slate-500 cursor-pointer`}
              key={date.id}
              title={`${date.marks.at(0)?.summary} selanjutnya`}
            >
              {date.date}
            </span>
          )
        })}
      </section>
    </article>
  )
}