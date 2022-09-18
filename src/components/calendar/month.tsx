import { Month } from '@/server/redis/calendar'
import { getDayNames } from '@/utils/datetime'

export type StaticMonth = Month

export type MonthProps = {
  data: StaticMonth
}

export function MonthCalendar({ data }: MonthProps) {
  return (
    <article key={data.id} className="flex flex-col gap-4">
      <header className="grid grid-cols-7 gap-px text-sm text-center">
        {getDayNames((dayName) => (
          <div
            className="shadow-[0_0_0_1px_rgb(100,116,139)]  py-2 px-1 text-ellipsis overflow-hidden"
            key={dayName}
          >
            {dayName}
          </div>
        ))}
      </header>
      <section className="grid grid-cols-7 box-border gap-px text-center text-sm">
        {data.offsets.prev.map((date) => {
          const title = date.events.at(0)?.summary.toString()
          return (
            <span
              className={`shadow-[0_0_0_1px_rgb(100,116,139)] py-2 text-slate-500 cursor-pointer`}
              key={date.id}
              title={`${title} sebelumnya`}
            >
              {date.index}
            </span>
          )
        })}
        {data.dates.map((date) => {
          const isHoliday =
            date.events.at(0)?.type === 'default' ||
            date.events.at(0)?.type === 'holiday'

          const title = date.events.at(0)?.summary.toString()
          return (
            <span
              className={`shadow-[0_0_0_1px_rgb(100,116,139)] py-2 cursor-pointer ${
                isHoliday ? 'text-red-600 bg-red-50' : 'text-slate-900'
              }`}
              key={date.id}
              title={title}
            >
              {date.index}
            </span>
          )
        })}
        {data.offsets.next.map((date) => {
          const title = date.events.at(0)?.summary.toString()
          return (
            <span
              className={`shadow-[0_0_0_1px_rgb(100,116,139)] py-2 text-slate-500 cursor-pointer`}
              key={date.id}
              title={`${title} selanjutnya`}
            >
              {date.index}
            </span>
          )
        })}
      </section>
    </article>
  )
}
