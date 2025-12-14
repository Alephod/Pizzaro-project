'use client'

import clsx from 'clsx'

import styles from './Radio.module.scss'

interface RadioProps<T extends string> {
  label: string;
  value: T;
  checked: boolean;
  onChange: (value: T) => void;
  className?: string;
  disabled?: boolean;
}

export function Radio<T extends string>({
  label,
  value,
  checked,
  onChange,
  className,
  disabled = false,
}: RadioProps<T>) {
  return (
    <label className={clsx(styles.radioLabel, className, { [styles.disabled]: disabled })}>
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={() => !disabled && onChange(value)}
        disabled={disabled}
        className={styles.radioInput}
      />
      <span className={styles.radioText}>{label}</span>
    </label>
  )
}

interface RadioGroupProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  disabled?: boolean;
}

export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  className,
  disabled = false,
}: RadioGroupProps<T>) {
  return (
    <div className={clsx(styles.radioGroup, className)}>
      {options.map((option) => (
        <Radio
          key={option.value}
          label={option.label}
          value={option.value}
          checked={value === option.value}
          onChange={onChange}
          disabled={disabled}
        />
      ))}
    </div>
  )
}