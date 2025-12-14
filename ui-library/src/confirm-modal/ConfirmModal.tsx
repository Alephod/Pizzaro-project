'use client'

import { useContext, useEffect, useId } from 'react'

import { Button } from './../button/Button'
import { ModalContext } from './../modal/ModalProvider'
import styles from './ConfirmModal.module.scss'

interface ConfirmModalProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отменить',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      } else if (e.key === 'Enter') {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault()
          onConfirm()
        }
      }
    }

    document.addEventListener('keydown', handleKey)

    return () => document.removeEventListener('keydown', handleKey)
  }, [onCancel, onConfirm])

  return (
    <div className={styles.confirmModal} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined}>
      {title && <h3 id={titleId} className={styles.confirmTitle}>{title}</h3>}
      <div className={styles.confirmMessage}>{message}</div>

      <div className={styles.confirmActions}>

        <Button
          type="button"
          size="md"
          variant="secondary"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          size="md"
          variant={destructive ? 'danger' : 'primary'}
          onClick={onConfirm}
          className={styles.confirmButton}
        >
          {confirmText}
        </Button>
      </div>
    </div>
  )
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export function useConfirm() {
  const { openModal, closeModal } = useContext(ModalContext)

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const finish = (result: boolean) => {
        closeModal()
        resolve(result)
      }

      openModal(
        <ConfirmModal
          title={options.title}
          message={options.message}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          destructive={options.destructive ?? false}
          onConfirm={() => finish(true)}
          onCancel={() => finish(false)}
        />
      )
    })
  }

  return { confirm }
}
