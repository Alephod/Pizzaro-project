'use client'

import React, { useContext } from 'react'

import { Button, ModalContext, CartItem, useInfoModal } from '@my-app/ui-library'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { ConfigureProductModal } from '@/components/configure-product-modal/ConfigureProductModal'
import { useCart } from '@/providers/CartProvider'
import type { CartItem as CartItemType } from '@/types/cart'
import type { MenuSection } from '@/types/menu'
import { normalizePrice } from '@/utils'

import styles from './Cart.module.scss'
import { AuthModal } from '../auth-modal/AuthModal'

interface CartProps {
  isOpen: boolean
  onClose: () => void
}

export function Cart({ isOpen, onClose }: CartProps) {
  const { items, updateItem, removeItem } = useCart()
  const { data: session } = useSession()
  const router = useRouter()
  const { openModal, closeModal } = useContext(ModalContext)
  const { showInfo } = useInfoModal()

  const totalSum = items.reduce((sum, item) => sum + item.count * item.cost, 0)
  const totalSumDisplay = normalizePrice(totalSum)

  if (!isOpen) return null

  const handleCheckout = () => {
    if (session?.user) {
      onClose()
      router.push('/checkout')

      return
    }

    const handleAuthClose = () => closeModal()
    const handleAuthSuccess = () => {
      closeModal()
      router.push('/checkout')
    }

    openModal(<AuthModal onClose={handleAuthClose} onSuccess={handleAuthSuccess} />)
  }

  const handleEdit = async (item: CartItemType) => {
    try {
      const response = await fetch(`/api/menu-section/${item.sectionId}`)

      if (!response.ok) throw new Error('Failed to fetch section')

      const section: MenuSection = await response.json()
      const product = section.items.find(p => p.name === item.name)

      if (!product) {
        await showInfo(`Товар «${item.name}» был удалён из меню`, 'Не найдено')

        return
      }

      openModal(
        <ConfigureProductModal product={product} schema={section.schema} initialItem={item} onClose={closeModal} />,
        'center'
      )
    } catch {
      await showInfo('Не удалось открыть редактирование товара', 'Ошибка')
    }
  }

  return (
    <div className={styles.sidebar} onClick={e => e.stopPropagation()}>
      <div className={styles.header}>
        <h2>Корзина</h2>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>Корзина пуста</p>
      ) : (
        <div className={styles.itemsList}>
          {items.map((item, idx) => (
            <CartItem<CartItemType>
              key={item.id ?? `${item.name}-${idx}`}
              item={item}
              onDecrease={() => updateItem(item.id || '', { count: item.count - 1 })}
              onIncrease={() => updateItem(item.id || '', { count: item.count + 1 })}
              onRemove={() => removeItem(item.id || '')}
              onEdit={() => handleEdit(item)}
            />
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <div className={styles.footerCost}>
          <p>Сумма заказа:</p>
          <span>{totalSumDisplay}</span>
        </div>

        <Button
          disabled={items.length === 0}
          className={styles.finalBtn}
          size="lg"
          variant="primary"
          onClick={handleCheckout}
        >
          Перейти к оформлению
        </Button>
      </div>
    </div>
  )
}
