import { getPeople, getPerson } from '@/server/redis/person'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function testRedis(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const person = await setPerson('albie', {
  //   firstName: 'Mohamad',
  //   lastName: 'Albie',
  //   age: 23,
  //   verified: true,
  //   skills: [],
  // })

  const person = await getPerson('halidah')

  const people = await getPeople()

  return res.status(200).json({ people, person })
}
