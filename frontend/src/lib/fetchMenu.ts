import { cache } from 'react'

import type { MenuSection } from '@/types/menu'

export const getMenuSections = cache(async (): Promise<MenuSection[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu-section`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to load menu')
  }

  return res.json()
})
