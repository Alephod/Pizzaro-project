'use client'
import React, { useState } from 'react'

import { useInfoModal, OrderCardAdmin } from '@my-app/ui-library'

import styles from '@/components/order-card/OrderCard.module.scss'
import type { OrderData } from '@/types/order'
import { getErrorMessage } from '@/utils'

type Meta = {
  page: number
  totalPages: number
  total: number
  perPage: number
}

export default function OrdersList<T extends OrderData>({
  initialOrders,
  initialMeta,
}: {
  initialOrders: T[]
  initialMeta: Meta
}) {
  const { showInfo } = useInfoModal()

  const [orders, setOrders] = useState<T[]>(initialOrders ?? [])
  const [meta, setMeta] = useState<Meta>(initialMeta ?? { page: 1, totalPages: 1, total: 0, perPage: 20 })
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    if (loading) return
    if (meta.page >= meta.totalPages) return
    setLoading(true)

    try {
      const nextPage = meta.page + 1
      const res = await fetch(`/api/orders?page=${nextPage}&perPage=${meta.perPage}`)

      if (!res.ok) throw new Error(`Ошибка ${res.status}`)
      const json = (await res.json()) as { orders: T[]; meta: Meta }

      setOrders((prev) => [...prev, ...json.orders])
      setMeta(json.meta)
    } catch (err) {
      void showInfo(`loadMore error: ${getErrorMessage(err)}`, 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderLocally = (id: string, patch: Partial<T>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? ({ ...o, ...patch } as T) : o)))
  }

  return (
    <section>
      <div className={styles.list} style={{ display: 'grid', gap: 12 }}>
        {orders.map((order) => (
          <OrderCardAdmin<typeof order>
            key={order.id}
            order={order}
            onUpdate={updateOrderLocally}
          />
        ))}
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
        {meta.page < meta.totalPages ? (
          <button onClick={loadMore} disabled={loading} className="button">
            {loading ? 'Загрузка...' : 'Загрузить ещё'}
          </button>
        ) : (
          <div style={{ color: '#666' }}>Больше заказов нет</div>
        )}
      </div>
    </section>
  )
}
