import React from 'react'

import OrdersList from './OrdersList'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Заказы — Pizzaro Admin',
}

export default async function OrdersPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders?page=1&perPage=20`, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error(`Ошибка получения заказов: ${res.status}`)
  }
  const json = await res.json()

  return (
    <main style={{ 'paddingTop': '24px', 'overflowY': 'scroll', 'flexGrow': '1', 'transition': '0.3s' }}>
      <div className='container'>
        <h1>Все заказы</h1>
        <OrdersList initialOrders={json.orders} initialMeta={json.meta} />
      </div>

    </main>
  )
}
