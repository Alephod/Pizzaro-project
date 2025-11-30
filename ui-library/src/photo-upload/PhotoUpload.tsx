'use client'
import { useRef } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'

import clsx from 'clsx'
import { Upload, Trash, Pencil } from 'lucide-react'

import style from './PhotoUpload.module.scss'

interface PhotoUploadProps {
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    accept?: string;
    disabled?: boolean;
    className?: string;
    preview?: string | null;
    onDelete?: () => void;
    error?: boolean;
}

export function PhotoUpload({ onChange, label = 'Загрузите фото', accept = 'image/*', disabled = false, className, preview, onDelete, error = false }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete) onDelete()
  }
  const handleReplace = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!disabled) {
      inputRef.current?.click()
    }
  }
  const handleWrapperClick = () => {
    if (!preview && !disabled) {
      inputRef.current?.click()
    }
  }

  return (
    <div className={style.outerWrapper}>
      <div
        className={clsx(style.wrapper, className, disabled && style.disabled, preview && style.hasPreview, error && style.error)}
        onClick={handleWrapperClick}
        tabIndex={disabled ? undefined : 0}
      >
        {preview ? (
          <div className={style.previewWrapper}>
            <img src={preview} alt="Preview" className={style.preview} />
            <div className={style.overlay} />
            {!disabled && (
              <div className={style.actions}>
                <button type="button" className={style.actionBtn} onClick={handleReplace}>
                  <Pencil size={20} />
                </button>
                <button type="button" className={style.actionBtn} onClick={handleDelete}>
                  <Trash size={20} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Upload className={style.icon} size={44} />
            <span className={style.label}>{label}</span>
          </>
        )}
        <input ref={inputRef} type="file" accept={accept} onChange={onChange} hidden disabled={disabled} />
      </div>
    </div>
  )
}
