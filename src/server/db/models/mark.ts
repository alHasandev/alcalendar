import { Prisma } from '@prisma/client'

export type DateMark = Prisma.MarkCreateWithoutDateInput

export type MarkType =
  | 'default'
  | 'app-event'
  | 'prev-month'
  | 'next-month'
  | 'prev-year'
  | 'next-year'
  | 'holiday'
  | 'leave'

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
