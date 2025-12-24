import AdminMenuClient from './AdminMenuClient'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Меню — Pizzaro Admin',
}

async function fetchMenuSections() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu-section`, {
    method: 'GET',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch menu sections')
  }

  return res.json()
}

export default async function AdminMenu() {
  const data = await fetchMenuSections()

  return <AdminMenuClient sectionsData={data} />
}
