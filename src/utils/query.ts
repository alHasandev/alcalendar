import { NextApiRequest } from 'next'

export const getReqQuery = <
  T extends Record<K, V>,
  K extends string | number,
  V extends T[K]
>(
  query: NextApiRequest['query'],
  queryKey: Record<K, V>,
  validator: (_value?: string | string[]) => T[K]
) => {
  const keys = Object.keys(queryKey) as K[]

  const fixValidator = validator

  return keys.reduce((prev, curr) => {
    if (!query?.[curr as string]) {
      throw new TypeError(`Requested query (${curr}) not found!`)
    }

    prev[curr] = fixValidator(query?.[curr as string]) || queryKey[curr]

    return prev
  }, Object.create(null) as T)
}

export const getDateQueryHandler = <
  T extends Record<K, number>,
  K extends string
>(
  query: NextApiRequest['query'],
  queryKey: T
) => {
  return getReqQuery(query, queryKey, (value) => {
    const numeric = Number(value)
    if (isNaN(numeric))
      throw new TypeError(`${value} is not valid query (number)`)
    return numeric as T[K]
  }) as T
}
