'use client'

import React, { useEffect, useRef, useState } from 'react'

import { Button, Input } from '@my-app/ui-library'
import { signIn, type SignInResponse } from 'next-auth/react'

import styles from './OtpModal.module.scss'

interface OtpModalProps {
  email: string;
  onClose: () => void;
  onBackToEmail: () => void;
  onSuccess?: () => void;
}

export function OtpModal({ email, onClose, onBackToEmail, onSuccess }: OtpModalProps) {
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitMessage, setSubmitMessage] = useState<string | undefined>(undefined)
  const [isResending, setIsResending] = useState<boolean>(false)
  const [resendCountdown, setResendCountdown] = useState<number>(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const formRef = useRef<HTMLFormElement | null>(null)

  useEffect(() => {
    const firstEmptyIndex = otpDigits.findIndex(d => d === '')

    if (firstEmptyIndex !== -1 && !isSubmitting) {
      inputRefs.current[firstEmptyIndex]?.focus()
    }
  }, [otpDigits, isSubmitting])

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000)

      return () => clearTimeout(timer)
    }

    return
  }, [resendCountdown])

  const handleDigitChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value

    if (value === '' || /^\d$/.test(value)) {
      const newDigits = [...otpDigits]

      newDigits[index] = value
      setOtpDigits(newDigits)
      setOtpError(undefined)

      // если все заполнено — сабмитим
      if (newDigits.every(d => d !== '')) {
        setTimeout(() => formRef.current?.requestSubmit(), 0)
      } else {
        if (value !== '' && index < inputRefs.current.length - 1) {
          inputRefs.current[index + 1]?.focus()
        }
      }
    }
  }

  const handleKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (otpDigits[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else {
        // оставляем поведение по удалению символа
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowRight' && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const pasteData = event.clipboardData.getData('text').trim()

    if (/^\d{6}$/.test(pasteData)) {
      const newDigits = pasteData.split('')

      setOtpDigits(newDigits)
      event.preventDefault()
      setTimeout(() => formRef.current?.requestSubmit(), 0)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const otpCode = otpDigits.join('')

    if (!/^\d{6}$/.test(otpCode)) {
      setOtpError('Введите 6-значный код')

      return
    }

    setIsSubmitting(true)
    setSubmitMessage(undefined)
    setOtpError(undefined)

    try {
      const result = (await signIn('otp', {
        redirect: false,
        email,
        code: otpCode,
      })) as SignInResponse | undefined

      if (!result) {
        setOtpError('Сервер не ответил. Попробуйте снова.')

        return
      }

      if (result.error) {
        setOtpError(result.error || 'Неверный код')
        setOtpDigits(['', '', '', '', '', ''])
        setTimeout(() => inputRefs.current[0]?.focus(), 0)

        return
      }

      if (onSuccess) {
        onSuccess()
      } else {
        onClose()
      }
    } catch {
      setOtpError('Ошибка входа. Попробуйте позже.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setSubmitMessage(undefined)
    setOtpError(undefined)

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))

        throw new Error(body?.error ?? 'Ошибка повторной отправки')
      }

      setSubmitMessage('Код отправлен повторно')
      setOtpDigits(['', '', '', '', '', ''])
      setResendCountdown(60)
    } catch {
      setOtpError('Ошибка отправки. Попробуйте позже.')
    } finally {
      setIsResending(false)
    }
  }

  const handleChangeEmail = () => {
    onBackToEmail()
  }

  return (
    <div className={styles.modalContent}>
      <h2 className={styles.title}>Введите код с почты</h2>
      <p className={styles.description}>
        {email} <span className={styles.changeLink} onClick={handleChangeEmail}>Изменить</span>
      </p>

      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.otpInputs} onPaste={handlePaste}>
          {otpDigits.map((digit, index) => (
            <Input
              key={index}
              type="text"
              value={digit}
              onChange={handleDigitChange(index)}
              onKeyDown={handleKeyDown(index)}
              maxLength={1}
              ref={(el) => { inputRefs.current[index] = el }}
              error={!!otpError}
              className={styles.otpInput}
              disabled={isSubmitting}
            />
          ))}
        </div>

        {otpError && <p className={styles.errorMessage}>{otpError}</p>}
        {submitMessage && <p className={styles.successMessage}>{submitMessage}</p>}

        <div className={styles.actions}>
          <Button
            type="button"
            size="md"
            variant="secondary"
            onClick={handleResend}
            disabled={isResending || isSubmitting || resendCountdown > 0}
            className={styles.resendButton}
          >
            {resendCountdown > 0 ? `Отправить еще раз (${resendCountdown})` : 'Отправить еще раз'}
          </Button>
        </div>
      </form>
    </div>
  )
}