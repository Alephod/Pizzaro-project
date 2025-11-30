'use client'

import type { RefObject } from 'react'
import React, { useState } from 'react'

import { Button, Input } from '@my-app/ui-library'
import { X } from 'lucide-react'

import type { ProfileData } from '@/types/profile'

import styles from './ProfileForm.module.scss'

interface ProfileEditProps {
  initial: ProfileData;
  onSave: (data: Partial<ProfileData>) => void;
  onCancel: () => void;
  onDelete: () => void;
  saving?: boolean;
  formReference: RefObject<HTMLFormElement | null>;
}

interface Errors {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
}

const onlyDigits = (str: string) => str.replace(/\D/g, '')

export default function ProfileEdit({
  initial,
  onSave,
  onCancel,
  onDelete,
  saving = false,
  formReference,
}: ProfileEditProps) {
  const [fullName, setFullName] = useState(initial.name ?? '')
  const [phone, setPhone] = useState(initial.phone ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(
    initial.dob ? new Date(initial.dob).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.') : ''
  )
  const [addresses, setAddresses] = useState<string[]>(initial.addresses ?? [])
  const [errors, setErrors] = useState<Errors>({})

  const validate = (): boolean => {
    const newErrors: Errors = {}

    if (!fullName.trim()) newErrors.fullName = 'Введите имя'

    if (phone) {
      const digits = onlyDigits(phone)
      const normalized = digits.startsWith('8') ? '7' + digits.slice(1) : digits

      if (normalized.length !== 11 || !normalized.startsWith('7')) {
        newErrors.phone = 'Некорректный номер телефона'
      }
    }

    if (dateOfBirth) {
      const digits = onlyDigits(dateOfBirth)

      if (digits.length !== 8) {
        newErrors.dateOfBirth = 'Формат: ДД.ММ.ГГГГ'
      } else {
        const day = +digits.slice(0, 2)
        const month = +digits.slice(2, 4)
        const year = +digits.slice(4)
        const date = new Date(year, month - 1, day)

        if (
          date.getDate() !== day ||
          date.getMonth() + 1 !== month ||
          date.getFullYear() !== year ||
          date > new Date()
        ) {
          newErrors.dateOfBirth = 'Некорректная дата'
        } else if ((new Date().getFullYear() - year) < 14) {
          newErrors.dateOfBirth = 'Возраст должен быть от 14 лет'
        }
      }
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const validatePhone = () => {
    const newErrors: Errors = {}

    if (phone) {
      const digits = onlyDigits(phone)
      const normalized = digits.startsWith('8') ? '7' + digits.slice(1) : digits

      if (normalized.length !== 11 || !normalized.startsWith('7')) {
        newErrors.phone = 'Некорректный номер телефона'
      }
    }
    setErrors(prev => ({ ...prev, ...newErrors }))
  }

  const validateDateOfBirth = () => {
    const newErrors: Errors = {}

    if (dateOfBirth) {
      const digits = onlyDigits(dateOfBirth)

      if (digits.length !== 8) {
        newErrors.dateOfBirth = 'Формат: ДД.ММ.ГГГГ'
      } else {
        const day = +digits.slice(0, 2)
        const month = +digits.slice(2, 4)
        const year = +digits.slice(4)
        const date = new Date(year, month - 1, day)

        if (
          date.getDate() !== day ||
          date.getMonth() + 1 !== month ||
          date.getFullYear() !== year ||
          date > new Date()
        ) {
          newErrors.dateOfBirth = 'Некорректная дата'
        } else if ((new Date().getFullYear() - year) < 14) {
          newErrors.dateOfBirth = 'Возраст должен быть от 14 лет'
        }
      }
    }
    setErrors(prev => ({ ...prev, ...newErrors }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const cleanPhone = phone ? '+7' + onlyDigits(phone).slice(-10) : null
    const cleanDob = dateOfBirth
      ? (() => {
        const d = onlyDigits(dateOfBirth)

        return `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)}`
      })()
      : null

    onSave({
      name: fullName.trim(),
      phone: cleanPhone,
      dob: cleanDob,
      addresses: addresses.map(a => a.trim()).filter(Boolean),
    })
  }

  const updateAddress = (index: number, value: string) => {
    setAddresses(prev => {
      const updated = [...prev]

      updated[index] = value

      return updated
    })
  }

  return (
    <>
      <form ref={formReference} onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>

          <Input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            error={!!errors.fullName}
            errorMessage={errors.fullName}
            placeholder='Ваше имя'
          />
        </div>
        <div className={styles.field}>
          <Input
            value={phone}
            onChange={e => {
              const value = e.target.value

              if (/^[0-9+-]*$/.test(value)) {
                setPhone(value)
              }
            }}
            onBlur={validatePhone}
            error={!!errors.phone}
            errorMessage={errors.phone}
            placeholder="Номер телефона"
          />
        </div>

        <div className={styles.field}>
          <Input
            value={dateOfBirth}
            onChange={e => {
              const value = e.target.value

              if (/^[0-9.]*$/.test(value)) {
                setDateOfBirth(value)
              }
            }}
            onBlur={validateDateOfBirth}
            error={!!errors.dateOfBirth}
            errorMessage={errors.dateOfBirth}
            placeholder="Дата рождения"
          />
        </div>

        <div className={styles.addressesWrapper}></div>
        <div className={styles.addAddressHeader}>
          <h2 className={styles.title}>Адреса доставки</h2> 
          <span className={styles.addAddress} onClick={() => setAddresses(prev => [...prev, ''])} >+ Добавить адрес</span>
        </div>
        
        <div className={styles.addresses}>
          {addresses.map((addr, index) => (
            <div key={index} className={styles.addressRow}>
              <Input
                value={addr}
                onChange={e => updateAddress(index, e.target.value)}
                placeholder={`Адрес ${index + 1}`}
                rightAdornment={<X onClick={() => setAddresses(prev => prev.filter((_, i) => i !== index))} />}
              />
            </div>
          ))}

        </div>
        <div className={styles.actions}>
          <Button type="button" variant="secondary" size="md" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="button" variant="primary" size="md" onClick={handleSubmit}>
            Сохранить
          </Button>

        </div>

      </form>
      <Button className={styles.deleteBtn} type="button" variant="danger" size="md" onClick={onDelete} disabled={saving}>
        Удалить аккаунт
      </Button>
    </>
  )
}