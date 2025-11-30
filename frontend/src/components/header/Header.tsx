'use client'

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'

import { Button, ModalContext } from '@my-app/ui-library'
import clsx from 'clsx'
import { LogIn, ShoppingCart, UserRound } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

import { Cart } from '@/components/cart/Cart'
import { useCart } from '@/providers/CartProvider'
import type { MenuSection } from '@/types/menu'

import style from './Header.module.scss'
import { AuthModal } from '../auth-modal/AuthModal'

import type { Session } from 'next-auth'

interface HeaderProps {
    sections: MenuSection[];
    session?: Session | null;
}

export function Header({ sections, session: initialSession }: HeaderProps) {
  const { openModal, closeModal } = useContext(ModalContext)
  const { data: liveSession, status } = useSession()

  const { items } = useCart()
  const totalCount = useMemo(() => items.reduce((sum, it) => sum + (it.count || 0), 0), [items])

  const displayedSession = status === 'loading' ? (initialSession ?? null) : (liveSession ?? null)

  const filteredSections = sections.filter((s) => s.items && s.items.length > 0)

  const headerRef = useRef<HTMLElement | null>(null)
  const bottomRowWrapperRef = useRef<HTMLDivElement | null>(null)
  const [isSticky, setIsSticky] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    const headerEl = headerRef.current
    const wrapperEl = bottomRowWrapperRef.current

    if (!headerEl || !wrapperEl) return

    let ticking = false
    const check = () => {
      ticking = false
      const headerRect = headerEl.getBoundingClientRect()
      const wrapperRect = wrapperEl.getBoundingClientRect()

      const headerBottom = headerRect.bottom
      const wrapperTop = wrapperRect.top
      const stuck = wrapperTop <= headerBottom + 0.5

      setIsSticky((prev) => !(prev === stuck ? prev : stuck))
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(check)
      }
    }

    const onResize = () => {
      check()
    }

    check()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const handleOpenCart = () => {
    openModal(<Cart isOpen onClose={closeModal} />, 'right')
  }

  const handleOpenEmailModal = () => {
    const handleClose = () => {
      closeModal()
    }

    openModal(<AuthModal onClose={handleClose} />)
  }

  return (
    <>
      <header className={style.header} ref={headerRef}>
        <div className="container">
          <div className={style.topRow}>
            <Link href="/" className={style.logo}>
              <Image width={150} height={57} className={style.logoImg} src="/logo.png" alt="logo" />
            </Link>

            <div className={style.actions}>
              {displayedSession?.user?.email ? (
                <div className={style.userInfo}>
                  <Link href={'/profile'} className={style.userProfile}>
                    <UserRound size={24} />
                    {displayedSession.user.name !== '' ? displayedSession.user.name : 'Профиль'}
                  </Link>
                </div>
              ) : (
                <Button type="button" size="md" variant="primary" onClick={handleOpenEmailModal}>
                  <LogIn size={20} />
                                    Войти
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div ref={bottomRowWrapperRef} className={style.bottomRowWrapper}>
        <div className={clsx(style.bottomRow, 'container', isSticky && style.sticky)}>
          <div className={style.navWrapper}>
            <Link href="/" className={style.navLogo}>
              <Image width={40} height={40} src="/logo-sm.png" alt="" />
            </Link>
            <nav className={style.nav} aria-label="Main navigation">
              {filteredSections.map((section) => (
                <Link key={section.id} href={`/#section-${section.slug}`} className={style.navItem}>
                  {section.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className={style.rightControls}>
            <button onClick={handleOpenCart} className={style.cartBtn}>
              <ShoppingCart size={22} />
                            Корзина ({hydrated ? totalCount : 0})
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
