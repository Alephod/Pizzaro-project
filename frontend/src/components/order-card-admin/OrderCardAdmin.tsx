'use client'
import React, { useState, useEffect } from 'react'

import { Button } from '@my-app/ui-library'
import clsx from 'clsx'
import { ArrowRight, Pencil, Check, UtensilsCrossed, Truck, PackageCheck } from 'lucide-react'

import type { OrderData } from '@/types/order'
import { getErrorMessage, normalizePrice } from '@/utils'

import styles from './OrderCardAdmin.module.scss'
import { useInfoModal } from '../info-modal/InfoModal'

const STATUS_ORDER: OrderData['status'][] = ['Принято', 'Готовится', 'Доставляется', 'Доставлено']

function itemsPreview(items: OrderData['items']) {
  if (!Array.isArray(items) || items.length === 0) return ''

  return items
    .map((it) => `${it.name}${it.variant ? ` · ${it.variant}` : ''} - x${it.count}`)
    .join(', ')
}

async function patchStatus(orderId: string, status: OrderData['status']) {
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)

    throw new Error(`Ошибка обновления: ${res.status} ${text}`)
  }

  return res.json()
}

export default function OrderCardAdmin({
  order,
  onUpdate,
}: {
  order: OrderData;
  onUpdate?: (id: string, patch: Partial<OrderData>) => void;
}) {
  const { showInfo } = useInfoModal()
  const [isSaving, setIsSaving] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [created, setCreated] = useState('')

  const preview = itemsPreview(order.items)

  useEffect(() => {
    setCreated(new Date(order.createdAt).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }))
  }, [order.createdAt])

  const handleQuickToggle = async () => {
    const idx = STATUS_ORDER.indexOf(order.status)

    if (idx >= STATUS_ORDER.length - 1) return
    const next = STATUS_ORDER[idx + 1]

    onUpdate?.(order.id, { status: next, updatedAt: new Date().toISOString() })
    setIsSaving(true)

    try {
      await patchStatus(order.id, next)
    } catch (err) {
      void showInfo(`Не удалось обновить статус: ${getErrorMessage(err)}`, 'Ошибка')
      onUpdate?.(order.id, { status: order.status, updatedAt: order.updatedAt })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async (status: OrderData['status']) => {
    if (status === order.status) {
      setShowEditor(false)

      return
    }
    setIsSaving(true)
    const prev = order.status

    onUpdate?.(order.id, { status, updatedAt: new Date().toISOString() })

    try {
      await patchStatus(order.id, status)
      setShowEditor(false)
    } catch (err) {
      void showInfo(`Не удалось сохранить статус: ${getErrorMessage(err)}`, 'Ошибка')
      onUpdate?.(order.id, { status: prev, updatedAt: order.updatedAt })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.info}>
          <div className={styles.title}>Заказ № {order.id}</div>
          <div className={styles.address} title={order.address}>
            {order.address}
          </div>
        </div>

        <div className={styles.actions}>
          {order.status !== 'Доставлено' && (
            <Button
              onClick={handleQuickToggle}
              disabled={isSaving}
              loading={isSaving}
              title="Быстрая смена статуса"
              size='md'
              variant='primary'
            >
              {isSaving ? '' : <ArrowRight size={18} />}
            </Button>
          )}

          <Button
            onClick={() => setShowEditor((s) => !s)}
            title="Редактировать статус"
            size='md'
            variant='secondary'
            aria-label="Редактировать"
          >
            <Pencil size={16} />
          </Button>
        </div>
      </div>

      <div className={styles.preview}>{preview}</div>

      <div className={styles.footer}>
        <div className={styles.statusGroup}>
          <div className={clsx(styles.status, {
            [styles.statusAccepted]: order.status === 'Принято',
            [styles.statusPreparing]: order.status === 'Готовится',
            [styles.statusDelivering]: order.status === 'Доставляется',
            [styles.statusDelivered]: order.status === 'Доставлено',
          })}>{order.status}</div>
          <div className={styles.date}>{created}</div>
        </div>

        <div className={styles.priceGroup}>
          <div className={styles.price}>{normalizePrice(order.total)}</div>
        </div>
      </div>

      {showEditor && (
        <div className={styles.editor}>
          <Button
            size='md'
            variant='primary'
            onClick={() => handleSave('Принято')}
            disabled={isSaving}
            className={styles.buttonAccepted}
          >
            <Check size={16} />
            Принято
          </Button>
          <Button
            size='md'
            variant='primary'
            onClick={() => handleSave('Готовится')}
            disabled={isSaving}
            className={styles.buttonPreparing}
          >
            <UtensilsCrossed size={16} />
            Готовится
          </Button>
          <Button
            size='md'
            variant='primary'
            onClick={() => handleSave('Доставляется')}
            disabled={isSaving}
            className={styles.buttonDelivering}
          >
            <Truck size={16} />
            Доставляется
          </Button>
          <Button
            size='md'
            variant='primary'
            onClick={() => handleSave('Доставлено')}
            disabled={isSaving}
            className={styles.buttonDelivered}
          >
            <PackageCheck size={16} />
            Доставлено
          </Button>
        </div>
      )}
    </article>
  )
}