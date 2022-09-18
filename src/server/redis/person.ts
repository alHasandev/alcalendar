import { RedisJsonData } from 'redis-om'
import { getRedisJSON, getRedisJSONAll, setRedisJSON } from './client'

const model = 'user'

interface Person extends RedisJsonData {
  firstName: string
  lastName: string
  age: number
  verified: boolean
  location?: {
    longitude: number
    latitude: number
  }
  locationUpdated?: string
  skills: string[]
  personalStatement?: string
}

export const example = {
  firstName: 'Rupert',
  lastName: 'Holmes',
  age: 75,
  verified: false,
  location: {
    longitude: 45.678,
    latitude: 45.678,
  },
  locationUpdated: '2022-03-01T12:34:56.123Z',
  skills: ['singing', 'songwriting', 'playwriting'],
  personalStatement: 'I like piña coladas and walks in the rain',
}

export const setPerson = async (id: string, person: Person) => {
  await setRedisJSON(model, id, person)

  return person
}

export const getPerson = async (id: string) => {
  const person: Person | null = await getRedisJSON(model, id)

  return person
}

export const getPeople = async () => {
  const people: Person[] = await getRedisJSONAll(model)

  return people
}
