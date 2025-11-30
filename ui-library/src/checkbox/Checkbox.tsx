'use client'

'use client'

import type { FC, MouseEvent } from 'react'

import clsx from 'clsx'
import { Check } from 'lucide-react'

import style from './Checkbox.module.scss'

interface CheckboxProps {
    label?: string;
    isChecked: boolean;
    onToggle: () => void;
    isDisabled?: boolean;
    className?: string;
}

export const Checkbox: FC<CheckboxProps> = ({ label, isChecked, onToggle, isDisabled = false, className }) => {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()

    if (!isDisabled) {
      onToggle()
    }
  }

  return (
    <div
      onClick={handleClick}
      className={clsx(style.checkbox, className)}
      role="checkbox"
      aria-checked={isChecked}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? undefined : 0}
      onKeyDown={e => {
        if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <div className={style.box}>
        <Check className={style.icon} strokeWidth={3} />
      </div>

      {label && <span className={style.label}>{label}</span>}
    </div>
  )
}
