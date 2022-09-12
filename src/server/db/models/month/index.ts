export type { MonthProps } from './create'

export const monthArgs = {
  include: {
    dates: {
      include: {
        marks: true,
      },
    },
  },
}

export type MonthArgs = typeof monthArgs

export { makeMonthId, createMonthWithoutYearInput } from './create'
