'use client'

import { createContext, useState, type ReactNode } from 'react'

import { Modal } from './Modal'

interface ModalContextType {
    openModal: (content: ReactNode, position?: 'center' | 'right') => void;
    closeModal: () => void;
}

export const ModalContext = createContext<ModalContextType>({
  openModal: () => {
    throw new Error('ModalContext: openModal called outside of ModalProvider')
  },
  closeModal: () => {
    throw new Error('ModalContext: closeModal called outside of ModalProvider')
  },
})

interface ModalProviderProps {
    children: ReactNode;
}

interface ModalEntry {
    content: ReactNode;
    position: 'center' | 'right';
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modalStack, setModalStack] = useState<ModalEntry[]>([])

  const openModal = (newContent: ReactNode, position: 'center' | 'right' = 'center') => {
    setModalStack(previousStack => [...previousStack, { content: newContent, position }])
  }

  const closeModal = () => {
    setModalStack(previousStack => previousStack.slice(0, -1))
  }

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalStack.map((modalEntry, index) => (
        <Modal key={index} isOpen={true} position={modalEntry.position} onClose={closeModal} zIndex={1000 + index * 10}>
          {modalEntry.content}
        </Modal>
      ))}
    </ModalContext.Provider>
  )
}
