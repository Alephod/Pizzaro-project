'use client'

import type { ReactNode, MouseEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import clsx from 'clsx'
import ReactDOM from 'react-dom'

import style from './Modal.module.scss'

let openModalsCount = 0

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    zIndex?: number;
    position?: 'center' | 'right';
    showCloseButton?: boolean;
}

export function Modal({ isOpen, onClose, children, className, zIndex = 1000, position = 'center', showCloseButton = true }: ModalProps) {
  const pointerDownOnBackdrop = useRef(false)
  const contentContainer = useRef<HTMLDivElement>(null)
  const backdropContainer = useRef<HTMLDivElement>(null)
  const [isClosing, setIsClosing] = useState(false)
  const animationDuration = 300 // Время анимации закрытия в миллисекундах

  // Запустить анимацию закрытия и уведомить после завершения
  const startClose = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)

    const closingClass = position === 'right' ? style.closingRight : style.closingCenter

    contentContainer.current?.classList.add(closingClass)
    backdropContainer.current?.classList.add(style.backdropClosing)

    setTimeout(() => {
      onClose()
    }, animationDuration)
  }, [isClosing, onClose, animationDuration, position])

  // Закрытие по Escape и popstate
  useEffect(() => {
    if (!isOpen) return

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') startClose()
    }

    const handlePopState = () => {
      startClose()
    }

    window.history.pushState({ modal: true }, '')

    document.addEventListener('keydown', handleEscKey)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('keydown', handleEscKey)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isOpen, startClose])

  // Блокировка скролла body
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      openModalsCount++

      if (openModalsCount === 1) {
        document.documentElement.style.overflowY = 'hidden'
        document.body.style.paddingRight = `${scrollbarWidth}px`
        document.body.style.position = 'relative'
      }

      return () => {
        openModalsCount--

        if (openModalsCount === 0) {
          document.documentElement.style.overflowY = ''
          document.body.style.paddingRight = ''
          document.body.style.position = ''
        }
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) setIsClosing(false)
  }, [isOpen])

  if (!isOpen) return null

  // Начало нажатия на бэкдроп
  const handleBackdropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerDownOnBackdrop.current = event.target === event.currentTarget
  }

  // Закрываем только если pointerdown тоже был на бэкдропе
  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target && pointerDownOnBackdrop.current) {
      startClose()
    }
    pointerDownOnBackdrop.current = false
  }

  const contentClass = position === 'right' ? style.modalContentRight : style.modalContentCenter

  return ReactDOM.createPortal(
    <div
      ref={backdropContainer}
      className={`${style.modalBackdrop} ${isClosing ? style.backdropClosing : ''} ${className || ''}`}
      style={{ zIndex }}
      onPointerDown={handleBackdropPointerDown}
      onClick={handleBackdropClick}
    >
      <div
        ref={contentContainer}
        className={clsx(style.modalContent, contentClass, isClosing ? (position === 'right' ? style.closingRight : style.closingCenter) : '')}
        onClick={event => event.stopPropagation()}
      >
        {showCloseButton && <button onClick={startClose} aria-label="Close modal" className={style.modalCloseBtn} />}
        {children}
      </div>
    </div>,
    document.body
  )
}
