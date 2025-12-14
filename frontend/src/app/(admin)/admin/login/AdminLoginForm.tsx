'use client'

import { useState } from 'react'

import { Button, Input } from '@my-app/ui-library'
import { useRouter } from 'next/navigation'
import { signIn, type SignInResponse } from 'next-auth/react'

import style from './page.module.scss'

export function AdminLoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = (await signIn('admin-credentials', {
      redirect: false,
      username: username.trim(),
      password: password.trim(),
    })) as SignInResponse | undefined

    if (!res) {
      setError('Сервер не ответил. Проверьте логи.')

      return
    }

    if (res.error) {
      setError('Неверный логин или пароль')

      return
    }

    router.push('/admin/dashboard')
  }

  return (
    <form className={style.form} onSubmit={handleSubmit}>
      <Input type="text" placeholder="Ваш логин" value={username} onChange={e => setUsername(e.target.value)} />
      <Input type="password" placeholder="Ваш пароль" value={password} onChange={e => setPassword(e.target.value)} />
      <Button type="submit" size="lg" variant="primary">Войти</Button>
      {error && <p className={style.errorMassage}>{error}</p>}
    </form>
  )
}
