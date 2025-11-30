'use client'

import React from 'react'

import { Button, Input } from '@my-app/ui-library'

import type { ProfileData } from '@/types/profile'

import styles from './ProfileView.module.scss'

interface ProfileViewProps {
  profile: ProfileData;
  onEdit: () => void;
  onSignOut: () => void;
  isLoading: boolean;
}

export default function ProfileView({ profile, onSignOut, isLoading }: ProfileViewProps) {
  const formattedDate = profile.dob
    ? new Date(profile.dob).toLocaleDateString('ru-RU')
    : '—'

  return (
    <div className={styles.view}>
      <div className={styles.field}>
        <Input value={profile.name || ''} readOnly placeholder='Ваше имя'  className={styles.readonly} />
      </div>

      <div className={styles.field}>
        <Input value={profile.email || ''} readOnly placeholder='Ваша электронная почта' className={styles.readonly} />
      </div>

      <div className={styles.field}>
        <Input value={profile.phone || ''} readOnly placeholder='Ваш номер телефона' className={styles.readonly} />
      </div>

      <div className={styles.field}>
        <Input value={formattedDate || ''} readOnly placeholder='Ваша дата рождения' className={styles.readonly} />
      </div>

      <div className={styles.field}>
        <h2>Адреса доставки</h2>
        {profile.addresses.length === 0 ? (
          <span className={styles.noAddressSpan}>Вы еще не добавляли адреса</span>
        ) : (
          <div className={styles.addressList}>
            {profile.addresses.map((addr, i) => (
              <Input readOnly key={i} value={addr} className={styles.readonly} />
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          variant="primary"
          size="md"
          onClick={onSignOut}
          disabled={isLoading}
          className={styles.logoutBtn}
        >
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  )
}