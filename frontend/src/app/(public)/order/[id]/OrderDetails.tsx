'use client'
import React from 'react'

import useSWR from 'swr'

import type { OrderData } from '@/types/order'
import { normalizePrice } from '@/utils'

import styles from './OrderDetails.module.scss'

const statusClass = (status: OrderData['status']) => {
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
    return ''
  }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<OrderData>)

export default function OrderDetails({ initialOrder }: { initialOrder: OrderData }) {
  const { data: currentOrder } = useSWR<OrderData>(`/api/orders/${initialOrder.id}`, fetcher, {
    refreshInterval: 5000,
    fallbackData: initialOrder,
  })

  if (!currentOrder) {
    return <div>Загрузка...</div>
  }

  const created = new Date(currentOrder.createdAt).toLocaleString('ru-RU')

  return (
    <main className='container'>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1>Заказ № {currentOrder.id}</h1>
          <div className={`${styles.status} ${statusClass(currentOrder.status)}`}>
            {currentOrder.status}
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.infoRow}>
            <p className={styles.infoTitle}>Адрес доставки</p>
            <div className={styles.infoValue}>{currentOrder.address}</div>
          </div>

          <div className={styles.infoRow}>
            <p className={styles.infoTitle}>Время доставки</p>
            <div className={styles.infoValue}>{currentOrder.deliveryTime}</div>
          </div>

          <div className={styles.infoRow}>
            <p className={styles.infoTitle}>Время заказа</p>
            <div className={styles.infoValue}>{created}</div>
          </div>

          <div className={styles.infoRow}>
            <p className={styles.infoTitle}>Способ оплаты</p>
            <div className={styles.infoValue}>{currentOrder.paymentMethod}</div>
          </div>

        </div>

        <div className={styles.orderItems}>
          <h2 className={styles.orderItemsTitle}>Состав заказа</h2>
          {currentOrder.items.map((item, index) => (
            <div key={index} className={styles.orderItem}>
              <div className={styles.itemHeader}>
                <span className={styles.itemName}>
                  {item.name} {item.variant && `· ${item.variant}`}
                </span>
                <span className={styles.itemQuantity}>× {item.count}</span>
                <span className={styles.itemPrice}>
                  {normalizePrice(item.cost * item.count)}
                </span>
              </div>

              {item.removedIngredients && item.removedIngredients.length > 0 && (
                <p className={`${styles.modifiers} ${styles.removed}`}>
                                    − {item.removedIngredients.join(', ')}
                </p>
              )}

              {item.addons && item.addons.length > 0 && (
                <p className={`${styles.modifiers} ${styles.added}`}>
                                    + {item.addons.join(', ')}
                </p>
              )}
            </div>
          ))}

          <div className={styles.total}>
            <h2 className={styles.totalTitle}>Итого</h2>
            <div className={styles.totalPrice}>{normalizePrice(currentOrder.total)}</div>
          </div>
        </div>
      </div>

    </main>
  )
}
