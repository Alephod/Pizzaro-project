'use client'

import clsx from 'clsx'

import styles from './Button.module.scss'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    type?: 'submit' | 'reset' | 'button';
    size: 'sm' | 'md' | 'lg';
    variant: 'primary' | 'secondary' | 'tertiary' | 'danger';
    className?: string;
    disabled?: boolean;
    loading?: boolean;
}

export function Button({ type = 'button', size, variant = 'primary', disabled = false, loading = false, className, ...props }: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button className={clsx(styles.button, styles[variant], styles[size], className)} type={type} disabled={isDisabled} {...props}>
      {loading && <div className={styles.spinner} />} 
      {props.children}
    </button>
  )
}