import { DateDataPayload } from '@/server/db/models/date'
import { MonthPayload } from '@/server/db/models/month/create'
import { getDayNames } from '@/utils/datetime'

type MonthOffsets = {
  prevOffsets?: DateDataPayload[]
  nextOffsets?: DateDataPayload[]
}

export type StaticMonth = MonthPayload & MonthOffsets

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
          const title = date.marks.at(0)?.summary.toString()
          return (
            <span
              className={`shadow-[0_0_0_1px_rgb(100,116,139)] py-2 text-slate-500 cursor-pointer`}
              key={date.id}
              title={`${title} sebelumnya`}
            >
              {date.date}
            </span>
          )
        })}
        {data.dates.map((date) => {
          const isHoliday =
            date.marks?.[0]?.type === 'default' ||
            date.marks?.[0]?.type === 'holiday'

          const title = date.marks.at(0)?.summary.toString()
          return (
            <span
              className={`shadow-[0_0_0_1px_rgb(100,116,139)] py-2 text-slate-900 cursor-pointer ${
                isHoliday ? 'text-red-600 bg-red-50' : ''
              }`}
              key={date.id}
              title={title}
            >
              {date.date}
            </span>
          )
        })}
        {data.nextOffsets?.map((date) => {
          const title = date.marks.at(0)?.summary.toString()
          return (
            <span
              className={`shadow-[0_0_0_1px_rgb(100,116,139)] py-2 text-slate-500 cursor-pointer`}
              key={date.id}
              title={`${title} selanjutnya`}
            >
              {date.date}
            </span>
          )
        })}
      </section>
    </article>
  )
}
