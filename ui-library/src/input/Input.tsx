import React, { useState } from 'react'

import clsx from 'clsx'
import { Eye, EyeOff } from 'lucide-react'

import styles from './Input.module.scss'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    errorMessage?: string;
    rightAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type = 'text', value = '', error = false, errorMessage, rightAdornment, disabled = false, className = '', placeholder, onChange, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputType = type === 'password' && showPassword ? 'text' : type

    const inputClass = [styles.input, error ? styles.error : '', disabled ? styles.disabled : ''].filter(Boolean).join(' ')

    const passwordAdornment =
            type === 'password' ? (
              <button type="button" className={styles.adornment} onClick={() => setShowPassword(prev => !prev)} tabIndex={-1}>
                {showPassword ? <EyeOff className={styles.eyeIcon} /> : <Eye className={styles.eyeIcon} />}
              </button>
            ) : null

    return (
      <div className={clsx(styles.inputWrapper, className)}>
        <div className={styles.inputContainer}>
          <input ref={ref} type={inputType} className={inputClass} disabled={disabled} placeholder={placeholder} value={value} onChange={onChange} {...rest} />
          {passwordAdornment}
          {rightAdornment && <span className={styles.adornment}>{rightAdornment}</span>}
        </div>

        {error && errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
      </div>
    )
  }
)

Input.displayName = 'Input'