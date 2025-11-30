'use client'

import { useContext } from 'react'

import styles from './InfoModal.module.scss'
import { Button } from '../button/Button'
import { ModalContext } from '../modal/ModalProvider'

interface InfoModalProps {
    title?: string;
    message: string;
    onClose: () => void;
}

export function InfoModal({ title, message, onClose }: InfoModalProps) {
  return (
    <div className={styles.infoModal}>
      {title && <h3 className={styles.infoTitle}>{title}</h3>}
      <div className={styles.infoMessage}>{message}</div>
      <div className={styles.infoActions}>
        <Button
          size="md"
          variant="primary"
          className={styles.infoModalBtn}
          onClick={onClose}
        >
                    OK
        </Button>
      </div>
    </div>
  )
}

export function useInfoModal() {
  const { openModal, closeModal } = useContext(ModalContext)

  const showInfo = (message: string, title?: string): Promise<void> => {
    return new Promise(resolve => {
      const handleClose = () => {
        closeModal()
        resolve()
      }

      openModal(
        <InfoModal title={title} message={message} onClose={handleClose} />
      )
    })
  }

  return { showInfo }
}