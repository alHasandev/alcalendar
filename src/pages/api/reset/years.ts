import { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/server/db/client'

export default async function resetDate(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await prisma.year.deleteMany()

  return res.status(200).json({
    delete: true,
    data,
  })
}
