'use client'

import React, { useState, useEffect } from 'react'

import { Button, Input, RadioGroup, Select } from '@my-app/ui-library'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'

import { useInfoModal } from '@/components/info-modal/InfoModal'
import { TimeSlots } from '@/components/time-slots/TimeSlots'
import { useCart } from '@/providers/CartProvider'
import type { ProfileDataFromDB } from '@/types/profile'
import { getErrorMessage, normalizePrice } from '@/utils'

import styles from './Checkout.module.scss'

interface CheckoutClientProps {
    initialProfile: ProfileDataFromDB;
}

export default function CheckoutClient({ initialProfile }: CheckoutClientProps) {
  const router = useRouter()
  const { showInfo } = useInfoModal()
  const { items, clear } = useCart()

  const [profile] = useState<ProfileDataFromDB>(initialProfile)
  const [cartHydrated, setCartHydrated] = useState(false)

  const [customerName, setCustomerName] = useState(initialProfile.data.name || '')
  const [phone, setPhone] = useState(initialProfile.data.phone || '')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryTime, setDeliveryTime] = useState<'asap' | 'other' | string>('asap')
  const [customTime, setCustomTime] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

  const [savedAddresses] = useState<string[]>(initialProfile.data.addresses || [])
  const [newlyAddedAddresses, setNewlyAddedAddresses] = useState<string[]>([])

  const [nameError, setNameError] = useState(false)
  const [phoneError, setPhoneError] = useState(false)
  const [phoneErrorMessage, setPhoneErrorMessage] = useState('Некорректный номер телефона')
  const [addressError, setAddressError] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  // Показывать ошибки только после попытки отправки формы
  const [submitAttempted, setSubmitAttempted] = useState(false)

  useEffect(() => {
    if (initialProfile.data.addresses && initialProfile.data.addresses.length > 0) {
      setDeliveryAddress(initialProfile.data.addresses[0])
    }
    setCartHydrated(true)
  }, [initialProfile])

  const onlyDigits = (str: string) => str.replace(/\D/g, '')
  const isValidPhone = (value: string) => {
    const digits = onlyDigits(value)
    // нормализуем: если пользователь ввёл с 8 — заменяем на 7 (российский формат)
    const normalized = digits.startsWith('8') ? '7' + digits.slice(1) : digits

    return normalized.length === 11 && normalized.startsWith('7')
  }

  const totalAmount = items.reduce((sum, item) => sum + item.count * item.cost, 0)
  const totalAmountDisplay = normalizePrice(totalAmount)

  const handleAddAddress = (newAddress: string) => {
    const trimmedAddress = newAddress.trim()

    if (trimmedAddress && !savedAddresses.includes(trimmedAddress) && !newlyAddedAddresses.includes(trimmedAddress)) {
      setNewlyAddedAddresses(prev => [...prev, trimmedAddress])
      setDeliveryAddress(trimmedAddress)
      if (submitAttempted) setAddressError(false)
    }
  }

  const validateForm = (): boolean => {
    let valid = true

    if (!customerName.trim()) { setNameError(true); valid = false } else setNameError(false)

    // phone: обязательно и должен соответствовать логике из профиля
    if (!phone.trim()) {
      setPhoneError(true)
      setPhoneErrorMessage('Обязательное поле')
      valid = false
    } else {
      if (!isValidPhone(phone)) {
        setPhoneError(true)
        setPhoneErrorMessage('Некорректный номер телефона')
        valid = false
      } else {
        setPhoneError(false)
        setPhoneErrorMessage('Некорректный номер телефона')
      }
    }

    if (!deliveryAddress.trim()) { setAddressError(true); valid = false } else setAddressError(false)

    return valid
  }

  const handlePlaceOrder = async () => {
    // показываем ошибки только после первой попытки сабмита
    setSubmitAttempted(true)

    if (!validateForm() || isPlacingOrder) return

    setIsPlacingOrder(true)

    const finalDeliveryTime =
            deliveryTime === 'asap'
              ? 'Как можно скорее'
              : deliveryTime === 'other'
                ? customTime.trim() || 'В указанное время'
                : deliveryTime

    const orderPayload = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: deliveryAddress.trim(),
      deliveryTime: finalDeliveryTime,
      paymentMethod,
      items: items.map(item => ({
        name: item.name,
        variant: item.variant,
        count: item.count,
        cost: item.cost,
        removedIngredients: item.removedIngredients,
        addons: item.addons,
      })),
      total: totalAmount,
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      if (!response.ok) throw new Error('Failed to create order')

      const { id } = await response.json()

      // Сохраняем новые адреса в профиль (если были)
      if (newlyAddedAddresses.length > 0 && profile?.id) {
        await fetch(`/api/user/${profile.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addresses: [...savedAddresses, ...newlyAddedAddresses],
          }),
        })
      }

      clear()
      router.push(`/order/${id}`)
    } catch (error) {
      void showInfo(`Не удалось оформить заказ: ${getErrorMessage(error)}`, 'Ошибка')
      setIsPlacingOrder(false)
    }
  }

  return (
    <main className={clsx(styles.checkout, 'container')}>
      <div className={styles.form}>
        <h1 className={styles.title}>Оформление заказа</h1>

        <div className={styles.field}>
          <label>Имя</label>
          <Input
            value={customerName}
            onChange={e => {
              setCustomerName(e.target.value)
              if (submitAttempted) setNameError(false)
            }}
            placeholder="Ваше имя"
            error={nameError}
            errorMessage="Обязательное поле"
          />
        </div>

        <div className={styles.field}>
          <label>Телефон</label>
          <Input
            value={phone}
            onChange={e => {
              const value = e.target.value

              // разрешаем только: необязательный ведущий '+', цифры и дефисы
              // это блокирует ввод нескольких '+' (например "+78++...")
              if (/^\+?[0-9-]*$/.test(value)) {
                setPhone(value)
                if (submitAttempted) setPhoneError(false)
              }
            }}
            placeholder="+7 (999) 123-45-67"
            error={phoneError}
            errorMessage={phoneError ? phoneErrorMessage : 'Некорректный номер телефона'}
          />
        </div>

        <div className={styles.field}>
          <label>Адрес доставки</label>
          <Select
            options={[...savedAddresses, ...newlyAddedAddresses]}
            value={deliveryAddress}
            onChange={value => {
              setDeliveryAddress(value)
              if (submitAttempted) setAddressError(false)
            }}
            onAddNew={handleAddAddress}
            placeholder="— Выберите или добавьте адрес —"
            allowAddNew={true}
            error={addressError}
            errorMessage="Обязательное поле"
          />
        </div>

        <div className={styles.field}>
          <label>Время доставки</label>
          <div className={styles.timeButtons} suppressHydrationWarning>
            <Button size="md" variant={deliveryTime === 'asap' ? 'primary' : 'secondary'} onClick={() => setDeliveryTime('asap')}>
                            Побыстрее
            </Button>
            <TimeSlots selected={deliveryTime} onSelect={setDeliveryTime} />
            <Button size="md" variant={deliveryTime === 'other' ? 'primary' : 'secondary'} onClick={() => setDeliveryTime('other')}>
                            Другое время
            </Button>
          </div>
          {deliveryTime === 'other' && (
            <Input className={styles.customTimeInput} value={customTime} onChange={e => setCustomTime(e.target.value)} placeholder="Например: 18:30" />
          )}
        </div>

        <div className={styles.field}>
          <label>Способ оплаты</label>
          <RadioGroup
            options={[
              { value: 'Картой при получении', label: 'Картой при получении' },
              { value: 'Наличными', label: 'Наличными' },
            ]}
            value={paymentMethod}
            onChange={setPaymentMethod}
          />
        </div>
      </div>

      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Состав заказа</h2>

        {!cartHydrated ? (
          <div className={styles.cartLoading}>Загрузка корзины…</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyCart}>Корзина пуста</div>
        ) : (
          <>
            <div className={styles.orderItems}>
              {items.map(item => (
                <div key={item.id} className={styles.orderItem}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemName}>
                      {item.name} {item.variant && `· ${item.variant}`}
                    </span>
                    <span className={styles.itemQuantity}>× {item.count}</span>
                  </div>
                  <div className={styles.itemPrice}>
                    {normalizePrice(item.cost * item.count)}
                  </div>

                  {item.removedIngredients?.length > 0 && (
                    <div className={styles.modifiers}>
                      <span className={styles.removed}>− {item.removedIngredients.join(', ')}</span>
                    </div>
                  )}

                  {item.addons?.length > 0 && (
                    <div className={styles.modifiers}>
                      <span className={styles.added}>+ {item.addons.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.total}>
              <span>Итого</span>
              <span className={styles.totalPrice}>{totalAmountDisplay}</span>
            </div>

            <Button
              size="lg"
              variant="primary"
              className={styles.placeOrderBtn}
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || items.length === 0}
              loading={isPlacingOrder}
            >
              {isPlacingOrder ? 'Оформляем…' : 'Оформить заказ'}
            </Button>
          </>
        )}
      </aside>
    </main>
  )
}
