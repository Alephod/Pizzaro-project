'use client'
import type { ChangeEvent, TextareaHTMLAttributes } from 'react'

import clsx from 'clsx'

import style from './Textarea.module.scss'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
    cols?: number;
    disabled?: boolean;
    className?: string;
    error?: boolean;
    errorMessage?: string;
}

export function Textarea({ value, onChange, placeholder = '', rows = 4, cols, disabled = false, className, error = false, errorMessage, ...rest }: TextareaProps) {
  const textareaClass = clsx(style.textarea, className, disabled && style.disabled, error && style.error)

  return (
    <div className={style.wrapper}>
      <textarea
        className={textareaClass}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        cols={cols}
        disabled={disabled}
        {...rest}
      />
      {errorMessage && <div className={style.errorMessage}>{errorMessage}</div>}
    </div>
  )
}