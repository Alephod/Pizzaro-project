'use client'

import React, { useState, useRef } from 'react'

import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'

import { useConfirm } from '@/components/confirm-modal/ConfirmModal'
import { useInfoModal } from '@/components/info-modal/InfoModal'
import type { ProfileData } from '@/types/profile'
import { getErrorMessage } from '@/utils'

import ProfileEdit from './ProfileEdit'
import styles from './ProfileManager.module.scss'
import ProfileView from './ProfileView'

export default function ProfileManager({ initialProfile }: { initialProfile: ProfileData }) {
  const [currentProfile, setCurrentProfile] = useState<ProfileData>(initialProfile)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { update } = useSession()
  const { showInfo } = useInfoModal()
  const { confirm } = useConfirm()
  const router = useRouter()
  const formReference = useRef<HTMLFormElement | null>(null)

  const startEditing = () => setIsEditing(true)
  const cancelEditing = () => setIsEditing(false)

  const saveProfile = async (updates: Partial<ProfileData>) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/user/${currentProfile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        await showInfo(`Ошибка обновления: ${getErrorMessage(errorData?.error)}`, 'Ошибка')

        return
      }

      const result = await response.json()

      const updatedProfile: ProfileData = {
        id: result.id,
        email: result.email,
        name: result.data.name ?? '',
        phone: result.data.phone ?? null,
        dob: result.data.dob ?? null,
        addresses: Array.isArray(result.data.addresses) ? result.data.addresses : [],
        orders: result.orders
      }

      setCurrentProfile(updatedProfile)
      setIsEditing(false)

      await update({ name: updatedProfile.name })

      await showInfo('Изменения успешно сохранены', 'Готово')
    } catch (error) {
      await showInfo(`Ошибка при сохранении: ${getErrorMessage(error)}`, 'Ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAccount = async () => {
    const confirmed = await confirm({
      title: 'Удалить аккаунт?',
      message: 'Это действие нельзя отменить.',
      destructive: true,
    })

    if (!confirmed) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/user/${currentProfile.id}`, { method: 'DELETE' })

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}))

        throw new Error(errorData?.error || 'Не удалось удалить аккаунт')
      }

      await signOut({ redirect: false })
      router.push('/')
    } catch (error) {
      await showInfo(`Ошибка: ${getErrorMessage(error)}`, 'Ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ redirect: false }).then(() => router.refresh())
  }

  const triggerFormSubmit = () => {
    if (formReference.current) {
      formReference.current.requestSubmit()
    }
  }

  return (
    <div className={styles.manager}>
      <div className={styles.header}>
        <h1>Личная информация</h1>

        <button
          type="button"
          className={styles.editButton}
          onClick={isEditing ? triggerFormSubmit : startEditing}
          disabled={isLoading}
        >
          {!isEditing && <Pencil size={24} />}
        </button>
      </div>

      {isEditing ? (
        <ProfileEdit
          initial={currentProfile}
          onSave={saveProfile}
          onCancel={cancelEditing}
          onDelete={deleteAccount}
          saving={isLoading}
          formReference={formReference}
        />
      ) : (
        <ProfileView
          profile={currentProfile}
          onEdit={startEditing}
          onSignOut={handleSignOut}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}