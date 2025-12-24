import { prisma } from '@/lib/prisma'
import type { OrderData, OrderItem, OrderStatus } from '@/types/order'

import OrderDetails from './OrderDetails'

import type { Metadata } from 'next'

type OrderPageParams = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

// generateMetadata тоже должен быть async и принимать Promise-параметры
export async function generateMetadata({
  params,
}: OrderPageParams): Promise<Metadata> {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!order) {
    return { title: 'Заказ не найден — Pizzaro' }
  }

  return { title: `Заказ №${order.id} — Pizzaro` }
}

// Функция нормализации items (оставляем как есть — она нормальная)
function normalizeItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((it): it is Record<string, unknown> => typeof it === 'object' && it !== null)
    .map((raw) => {
      const name = typeof raw.name === 'string' ? raw.name : 'Unnamed'
      const count = typeof raw.count === 'number' ? raw.count : Number(raw.count) || 0
      const cost = typeof raw.cost === 'number' ? raw.cost : Number(raw.cost) || 0
      const variant = typeof raw.variant === 'string' ? raw.variant : undefined
      const removedIngredients =
        Array.isArray(raw.removedIngredients) &&
          raw.removedIngredients.every((x) => typeof x === 'string')
          ? raw.removedIngredients
          : undefined
      const addons =
        Array.isArray(raw.addons) && raw.addons.every((x) => typeof x === 'string')
          ? raw.addons
          : undefined

      return { name, count, cost, variant, removedIngredients, addons }
    })
}

// Сама страница — обязательно async!
export default async function OrderPage({ params }: OrderPageParams) {
  const { id } = await params // ← вот и всё, что нужно было добавить!

  const initialOrderFromDb = await prisma.order.findUnique({
    where: { id },
  })

  if (!initialOrderFromDb) {
    return (
      <div className="container" style={{ marginTop: '40px' }}>
        <h1>Заказ не найден</h1>
      </div>
    )
  }

  const items = normalizeItems(initialOrderFromDb.items)

  const allowedStatuses = ['Принято', 'Готовится', 'Доставляется', 'Доставлено'] as const
  const status = allowedStatuses.includes(initialOrderFromDb.status as OrderStatus)
    ? (initialOrderFromDb.status as OrderStatus)
    : 'Принято'

  const serializedOrder: OrderData = {
    id: initialOrderFromDb.id,
    customerName: initialOrderFromDb.customerName,
    phone: initialOrderFromDb.phone,
    address: initialOrderFromDb.address,
    deliveryTime: initialOrderFromDb.deliveryTime ?? '',
    paymentMethod: String(initialOrderFromDb.paymentMethod ?? ''),
    items,
    total: initialOrderFromDb.total ?? 0,
    status,
    createdAt: initialOrderFromDb.createdAt.toISOString(),
    updatedAt: initialOrderFromDb.updatedAt.toISOString(),
  }

  return <OrderDetails initialOrder={serializedOrder} />
}