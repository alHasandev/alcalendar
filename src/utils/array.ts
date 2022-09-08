export type IndexType<T extends readonly P[], P = string> = keyof {
  [K in keyof T as K extends `${infer U extends number}` ? U : never]: T[K]
}

export function range<T>(
  options: { from?: number; step?: number; to: number },
  callback: (_n: number) => T = (n) => n as unknown as T
) {
  const { from = 0, step = 1, to } = options

  if (!to) {
    throw Error('"to" must be specified')
  }

  if (to < from) {
    throw Error('"to" must be greater or equal "from"')
  }

  if (to === from) {
    return [] as T[]
  }

  const ranges = Array.from(
    { length: Math.ceil((to - from + 1) / step) },
    (_, i) => callback(i * step + from)
  ) as T[]

  return ranges
}
