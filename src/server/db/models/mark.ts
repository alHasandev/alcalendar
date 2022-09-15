import { Prisma } from '@prisma/client'
import { getDate, setDefaultOptions } from 'date-fns'
import { id } from 'date-fns/locale'

// Default options for date-fns
setDefaultOptions({
  locale: id,
})

export type DateMark = Prisma.MarkCreateWithoutDateInput

export type Mark = {
  id: string
  year: number
  month: number
  dateId: string
  type: string
  summary: string
  description: string | null
  image?: string | null
  startAt?: number | null
  endAt?: number | null
  authorId?: string | null
  groupId?: string | null
  updatedAt?: Date | null
}

export type MarkType =
  | 'default'
  | 'app-event'
  | 'prev-month'
  | 'next-month'
  | 'prev-year'
  | 'next-year'
  | 'holiday'
  | 'leave'

export const pushMarkToStaticData = (
  marks: Mark[],
  dataset: (_m: number, _n: number) => Mark[] | undefined
) => {
  marks.map((mark) => {
    const date = new Date(mark.dateId)
    const d = getDate(date)
    const m = date.getMonth()

    dataset(m, d - 1)?.push(mark)
  })
}

export const createDateMark = (
  data: {
    type: string
    summary: string
    description?: string
  },
  optionals?: Partial<Prisma.MarkUncheckedCreateInput>
) => {
  const mark: DateMark = {
    type: data.type,
    summary: data.summary,
    description: data.description,
    ...optionals,
  }

  return mark
}
