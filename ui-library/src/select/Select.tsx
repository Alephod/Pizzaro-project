'use client'

import React, { useState, useRef, useEffect } from 'react'

import clsx from 'clsx'

import styles from './Select.module.scss'

interface SelectProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    allowAddNew?: boolean;
    onAddNew?: (newValue: string) => void;
    error?: boolean;
    errorMessage?: string; 
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Выберите',
  className,
  disabled = false,
  allowAddNew = false,
  onAddNew,
  error = false,
  errorMessage,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newInputValue, setNewInputValue] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const displayValue = value || placeholder

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setIsAdding(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAdding])

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
    setIsAdding(false)
  }

  const handleAddClick = () => {
    setIsAdding(true)
    setNewInputValue('')
  }

  const handleAddSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = newInputValue.trim()

      if (trimmed && onAddNew) {
        onAddNew(trimmed)
      }
      setIsAdding(false)
      setNewInputValue('')
    }
  }

  return (
    <div
      ref={rootRef}
      className={clsx(styles.selectWrapper, className, {
        [styles.disabled]: disabled,
        [styles.open]: isOpen,
        [styles.error]: error,
      })}
    >
      <div
        className={clsx(styles.trigger, { [styles.error]: error })}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!disabled)
              setIsOpen(!isOpen)
          }
        }}
      >
        <span
          className={clsx(styles.value, {
            [styles.placeholder]: !value,
          })}
        >
          {displayValue}
        </span>
        <div className={styles.arrow}>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path
              d="M1 1L8 8L15 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          <div
            className={styles.option}
            onClick={() => handleSelect('')}
            role="option"
            aria-selected={!value}
          >
            {placeholder}
          </div>
          {options.map((option) => (
            <div
              key={option}
              className={clsx(styles.option, {
                [styles.selected]: option === value,
              })}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={option === value}
            >
              {option}
            </div>
          ))}

          {allowAddNew && !isAdding && (
            <div
              className={clsx(styles.option, styles.addButton)}
              onClick={handleAddClick}
              role="button"
            >
                            + Добавить
            </div>
          )}

          {allowAddNew && isAdding && (
            <div className={styles.addInputWrapper}>
              <input
                ref={inputRef}
                type="text"
                className={styles.addInput}
                value={newInputValue}
                onChange={(e) => setNewInputValue(e.target.value)}
                onKeyDown={handleAddSubmit}
                placeholder="Введите новый адрес"
              />
            </div>
          )}
        </div>
      )}

      {error && errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
    </div>
  )
}