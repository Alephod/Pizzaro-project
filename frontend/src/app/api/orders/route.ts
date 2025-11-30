import { getServerSession } from 'next-auth'

import { clientAuthOptions } from '@/lib/auth/client'
import { prisma } from '@/lib/prisma'
import type { UserProfileData } from '@/types/profile'
import { generateOrderId } from '@/utils'

export async function POST(request: Request) {
  const body = await request.json()
  const session = await getServerSession(clientAuthOptions)

  const id = generateOrderId()

  await prisma.order.create({
    data: {
      id,
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      deliveryTime: body.deliveryTime,
      paymentMethod: body.paymentMethod,
      items: body.items,
      total: body.total,
      status: 'Принято',
      createdAt: new Date(),
    },
  })

  if (session?.user?.id) {
    const userId = Number(session.user.id)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { data: true },
    })

    if (user) {
      const currentData = user.data as UserProfileData

      await prisma.user.update({
        where: { id: userId },
        data: {
          data: {
            ...currentData,
            orders: [...(currentData.orders ?? []), id],
          },
        },
      })
    }
  }

  return Response.json({ id }, { status: 201 })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const pageParam = Number(url.searchParams.get('page') ?? '1')
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1

  const TAKE = 20
  const skip = (page - 1) * TAKE

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: TAKE,
    }),
    prisma.order.count(),
  ])

  const totalPages = Math.ceil(total / TAKE)

  return Response.json(
    {
      orders,
      meta: {
        total,
        page,
        totalPages,
        perPage: TAKE,
      },
    },
    { status: 200 }
  )
}