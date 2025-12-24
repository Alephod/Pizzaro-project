import React from 'react'

import clsx from 'clsx'
import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'

import OrderCard from '@/components/order-card/OrderCard'
import ProfileManager from '@/components/profile-manager/ProfileManager'
import { clientAuthOptions } from '@/lib/auth/client'
import type { OrderData } from '@/types/order'
import type { ProfileData } from '@/types/profile'

import styles from './page.module.scss'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Профиль пользователя — Pizzaro',
}

export default async function UserPage() {
  const session = await getServerSession(clientAuthOptions)

  if (!session?.user?.id) redirect('/')

  const userId = Number(session.user.id)

  if (!Number.isInteger(userId) || userId <= 0) notFound()

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error(`Ошибка получения профиля: ${res.status}`)
  }

  const json = await res.json()

  const profile: ProfileData = {
    id: json.id,
    email: json.email,
    name: typeof json.data?.name === 'string' ? json.data.name : '',
    phone: typeof json.data?.phone === 'string' ? json.data.phone : null,
    dob: typeof json.data?.dob === 'string' ? json.data.dob : null,
    addresses: Array.isArray(json.data?.addresses) ? json.data.addresses : [],
    orders: Array.isArray(json.data?.orders) ? json.data.orders : [],
  }

  const orderIds = [...profile.orders].reverse().slice(0, 5)

  const orders: OrderData[] = []

  for (const id of orderIds) {
    const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, {
      cache: 'no-store',
    })

    if (orderRes.ok) {
      const orderJson = await orderRes.json()

      orders.push(orderJson as OrderData)
    }
  }

  return (
    <main className={clsx(styles.page, 'container')}>
      <ProfileManager initialProfile={profile} />

      <div className={styles.orders}>
        <h1>Мои заказы</h1>

        {orders.length === 0 ? (
          <p className={styles.empty}>У вас пока нет заказов</p>
        ) : (
          <div className={styles.list}>
            {orders.map((order, index) => (
              <OrderCard key={index} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
