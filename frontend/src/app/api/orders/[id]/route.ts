import { getServerSession } from 'next-auth'

import { adminAuthOptions } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'

type RouteParams = {
  params: Promise<{ id: string }>
}

interface PatchBody {
  status: 'Принято' | 'Готовится' | 'Доставляется' | 'Доставлено'
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params 

  const order = await prisma.order.findUnique({
    where: { id },
  })

  if (!order) {
    return Response.json({ error: 'Заказ не найден' }, { status: 404 })
  }

  return Response.json(order)
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getServerSession(adminAuthOptions)

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params 

  const body = (await request.json()) as PatchBody

  if (!body.status) {
    return Response.json({ error: 'Status is required' }, { status: 400 })
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status: body.status },
  })

  return Response.json(updatedOrder)
}