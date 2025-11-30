'use client'
import { useState, useEffect } from 'react'

import clsx from 'clsx'
import Link from 'next/link'
import useSWR from 'swr'

import type { OrderData } from '@/types/order'
import { normalizePrice } from '@/utils'

import styles from './OrderCard.module.scss'

/**
 * Экспортируемые хелперы — теперь их можно тестировать напрямую.
 * Возвращаем пустую строку по умолчанию чтобы покрыть дефолтную ветвь.
 */
export function statusClass(status: OrderData['status'] | undefined) {
  switch (status) {
  case 'Принято':
    return styles.statusAccepted
  case 'Готовится':
    return styles.statusPreparing
  case 'Доставляется':
    return styles.statusDelivering
  case 'Доставлено':
    return styles.statusDelivered
  default:
    return '' // безопасный дефолт
  }
}

export function itemsPreview(items: OrderData['items'] | undefined | null) {
  if (!Array.isArray(items) || items.length === 0) return ''

  return items
    .map((it) => `${it.name}${it.variant ? ` · ${it.variant}` : ''} - x${it.count}`)
    .join(', ')
}

export const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<OrderData>)

export default function OrderCard({ order }: { order: OrderData }) {
  const { data: currentOrder } = useSWR<OrderData>(`/api/orders/${order.id}`, fetcher, {
    refreshInterval: 5000,
    fallbackData: order,
  })

  const preview = itemsPreview(currentOrder?.items ?? order.items)

  const [created, setCreated] = useState('')

  useEffect(() => {
    const createdAt = currentOrder?.createdAt ?? order.createdAt

    setCreated(new Date(createdAt).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }))
  }, [currentOrder?.createdAt, order.createdAt])

  return (
    <article className={styles.card}>
      <Link className={styles.header} href={'./order/' + (currentOrder?.id ?? order.id)}>
        <div className={styles.address} title={currentOrder?.address ?? order.address}>
          {currentOrder?.address ?? order.address}
        </div>

        <div className={clsx(styles.status, statusClass(currentOrder?.status ?? order.status))}>
          {currentOrder?.status ?? order.status}
        </div>
      </Link>

      <div className={styles.preview}>{preview}</div>

      <div className={styles.bottom}>
        <div className={styles.date}>{created}</div>
        <div className={styles.price}>{normalizePrice((currentOrder?.total ?? order.total) as number)}</div>
      </div>
    </article>
  )
}
