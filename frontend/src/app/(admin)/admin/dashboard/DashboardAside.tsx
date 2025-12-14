'use client'

import { useEffect, useRef, useState, type ElementType } from 'react'

import { ArrowLeft, EllipsisVertical, LogOut, Settings } from 'lucide-react'
import { Utensils, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

import style from './layout.module.scss'

interface AsideProps {
    username: string | null | undefined;
}

interface NavItem {
    name: string;
    href: string;
    icon: ElementType;
}

const navItems: NavItem[] = [
  {
    name: 'Меню',
    href: '/admin/dashboard/menu',
    icon: Utensils,
  },
  {
    name: 'Заказы',
    href: '/admin/dashboard/orders',
    icon: ShoppingCart,
  },
]

export default function DashboardAside({ username }: AsideProps) {
  const [isAsideClosed, setIsAsideClosed] = useState(false)
  const [isPopupMenuOpen, setIsPopupMenuOpen] = useState(false)

  const popupMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupMenuRef.current && e.target instanceof Node && !popupMenuRef.current.contains(e.target)) {
        setIsPopupMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <aside className={style.aside + ' ' + (isAsideClosed ? style.asideClosed : '')}>
      <div className={style.header}>
        <div className={style.logo}>
          <Image alt="Pizzaro admin" src="/logo-admin.svg" width={150} height={60} />
        </div>
        <div className={style.arrowWrapper}>
          <div className={style.arrow}>
            <ArrowLeft onClick={() => setIsAsideClosed(!isAsideClosed)} />
          </div>
        </div>
      </div>

      {navItems.map(item => {
        const Icon = item.icon

        return (
          <Link className={style.link} key={item.name} href={item.href} data-label={item.name}>
            <Icon className={style.icon} />
            <span>{item.name}</span>
          </Link>
        )
      })}

      <div className={style.profile}>
        <div className={style.profileAvatar}></div>
        <p>{username}</p>
        <div onClick={() => setIsPopupMenuOpen(!isPopupMenuOpen)}>
          <EllipsisVertical className={style.profileOptions} />
        </div>
      </div>
      {isPopupMenuOpen && (
        <div ref={popupMenuRef} className={style.popupMenu}>
          <Link href={'/admin/settings'} className={style.menuItem}>
            <Settings size={22} />
            <span>Настройки</span>
          </Link>
          <button className={`${style.menuItem} ${style.menuItemExit}`} onClick={() => signOut({ callbackUrl: '/admin/login' })}>
            <LogOut size={22} />
            <span>Выйти</span>
          </button>
        </div>
      )}
    </aside>
  )
}
