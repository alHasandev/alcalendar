import { env } from '@/env/server.mjs'
import { createClient } from 'redis'

type RedisJsonData = {
  [key: string]: unknown
}

type RedisPayload<T> = { _id: string } & T

export const connection = createClient({
  socket: {
    tls: true,
    host: env.UPSTASH_REDIS_HOST,
    port: Number(env.UPSTASH_REDIS_PORT),
  },
  password: env.UPSTASH_REDIS_PASS,
})

connection.on('error', (err) => {
  throw err
})

export const composeKey = (model: string, id: string) => `${model}:${id}`

export const setRedisJSON = async <T extends RedisJsonData>(
  model: string,
  id: string,
  obj: T
) => {
  const client = await getClient()
  const payload = obj as RedisPayload<T>
  payload._id = id

  await client.hSet(model, id, JSON.stringify(obj))

  return payload
}

export const pushRedisArray = async <T extends string | number>(
  model: string,
  item: T
) => {
  const client = await getClient()
  await client.sAdd(model, item.toString())
}

export const getRedisArray = async (model: string) => {
  const client = await getClient()
  const arr = await client.sMembers(model)

  return arr
}

export const getRedisJSONAll = async <T>(model: string) => {
  const client = await getClient()
  const reply = await client.hGetAll(model)

  const arr = Object.values(reply).reduce((prev, curr) => {
    const obj = JSON.parse(curr) as RedisPayload<T>
    prev.push(obj)

    return prev
  }, [] as RedisPayload<T>[])

  return arr
}

export const getRedisJSON = async <T>(model: string, id: string) => {
  const client = await getClient()

  const obj = await client
    .hGet(model, id)
    .then((res) => (!res ? res : JSON.parse(res)))

  return obj as RedisPayload<T> | null
}

export const getClient = async () => {
  const isConnected = await connection
    .ping()
    .then((res) => res === 'PONG')
    .catch(() => false)

  if (!isConnected) {
    await connection.connect()
  }

  return connection
}

export default connection
