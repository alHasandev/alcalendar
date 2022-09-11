export const objToMap = <K extends string | number | symbol, V>(
  obj: Record<K, V>
) => {
  const map = Object.keys(obj).reduce((prev, curr) => {
    prev.set(Number(curr) as K, obj[curr as K])

    return prev
  }, new Map<K, V>())

  return map
}

export const serializeObject = <T>(obj: T) =>
  JSON.parse(JSON.stringify(obj)) as T
