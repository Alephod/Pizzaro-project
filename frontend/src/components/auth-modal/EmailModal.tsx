'use client'

import React, { useState } from 'react'

import { Button, Input } from '@my-app/ui-library'

import styles from './EmailModal.module.scss'

interface EmailModalProps {
  onClose: () => void;
  onEmailSent: (email: string) => void;
}

export function EmailModal({ onEmailSent }: EmailModalProps) {
  const [userEmail, setUserEmail] = useState<string>('')
  const [emailError, setEmailError] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitMessage, setSubmitMessage] = useState<string | undefined>(undefined)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailRegex.test(email)
  }

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserEmail(event.target.value)
    setEmailError(undefined)
    setSubmitMessage(undefined)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateEmail(userEmail)) {
      setEmailError('Пожалуйста, введите действительный email')

      return
    }

    setIsSubmitting(true)
    setSubmitMessage(undefined)
    setEmailError(undefined)

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))

        throw new Error(err?.error ?? 'Ошибка отправки')
      }

      const data = await response.json().catch(() => ({}))

      setSubmitMessage((data && (data.message as string)) ?? 'Код отправлен на ваш email')

      onEmailSent(userEmail)
    } catch {
      setEmailError('Ошибка отправки. Попробуйте позже.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.modalContent}>
      <h2 className={styles.title}>Введите ваш email</h2>
      <p className={styles.description}>Мы отправим код для входа на указанный адрес.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          type="email"
          placeholder="Ваш email"
          value={userEmail}
          onChange={handleEmailChange}
          error={!!emailError}
          className={styles.input}
        />

        {emailError && <p className={styles.errorMessage}>{emailError}</p>}
        {submitMessage && <p className={styles.successMessage}>{submitMessage}</p>}

        <div className={styles.actions}>
          <Button
            type="submit"
            size="lg"
            variant="primary"
            disabled={isSubmitting}
            className={styles.submitButton}
            loading={isSubmitting}
          >
            Отправить код
          </Button>
        </div>
      </form>
    </div>
  )
}
