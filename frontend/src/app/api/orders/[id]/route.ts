import { getServerSession } from 'next-auth'

import { adminAuthOptions } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'

interface PatchBody {
  status: 'Принято' | 'Готовится' | 'Доставляется' | 'Доставлено';
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
  })

  if (!order) {
    return Response.json({ error: 'Заказ не найден' }, { status: 404 })
  }

  return Response.json(order)
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(adminAuthOptions)

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as PatchBody

  // Защита от пустого/неверного статуса
  if (!body.status) {
    return Response.json({ error: 'Status is required' }, { status: 400 })
  }

  const updatedOrder = await prisma.order.update({
    where: { id: params.id },
    data: { status: body.status },
  })

  return Response.json(updatedOrder)
}