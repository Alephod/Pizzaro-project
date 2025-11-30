'use client'

import React from 'react'

import clsx from 'clsx'
import { Trash2 } from 'lucide-react'

import styles from './CartItem.module.scss'

import type { CartItem as CartItemType } from '../types/cart'

const MAX_COUNT = 30

function parseIngredients(description: string) {
  return description
    .split(',')
    .map(s => s.trim())
    .map(part => {
      const isRemovable = /\[ ?[xх] ?]$/i.test(part)
      const name = part.replace(/\[ ?[xх] ?]$/i, '').trim()

      return { name, isRemovable }
    })
}

export function CartItem<T extends CartItemType>(props: {
  item: T
  onDecrease: () => void
  onIncrease: () => void
  onRemove: () => void
  onEdit?: () => Promise<void> | void
}) {
  const { item, onDecrease, onIncrease, onRemove, onEdit } = props

  const totalPrice = item.cost * item.count
  const isMaxCount = item.count >= MAX_COUNT
  const ingredients = parseIngredients(item.description)
  const removedSet = new Set(item.removedIngredients.map(i => i.toLowerCase()))

  return (
    <div className={styles.item}>
      <div className={styles.itemImage}>
        <img src={item.imageUrl} alt={item.name} className="object-cover rounded-lg" />
      </div>

      <div className={styles.itemInfo}>
        <div className={styles.header}>
          <h3 className={styles.itemName}>{item.name}</h3>

          {item.variant && <span className={styles.variant}>{item.variant}</span>}
          <button onClick={onRemove} className={styles.removeBtn} aria-label="Удалить товар">
            <Trash2 size={18} />
          </button>
        </div>

        <p className={styles.description}>
          {ingredients.map((ingredient, index) => {
            const isRemoved = removedSet.has(ingredient.name.toLowerCase())

            return (
              <React.Fragment key={`${ingredient.name}-${index}`}>
                <span className={clsx(styles.ingredient, isRemoved && styles.removedIngredient)}>
                  {ingredient.name}
                </span>
                {index < ingredients.length - 1 && ', '}
              </React.Fragment>
            )
          })}
        </p>

        {item.addons.length > 0 && <p className={styles.addons}>+ {item.addons.join(', ')}</p>}

        <div className={styles.footer}>
          <button className={styles.changeBtn} onClick={() => onEdit?.()}>
            Изменить состав
          </button>

          <div className={styles.itemControls}>
            <button onClick={onDecrease} aria-label="Уменьшить количество" disabled={item.count <= 1} className={styles.countBtn}>
              −
            </button>

            <span className={styles.count}>{item.count}</span>

            <button onClick={onIncrease} aria-label="Увеличить количество" disabled={isMaxCount} className={styles.countBtn}>
              +
            </button>
          </div>

          <p className={styles.itemPrice}>{totalPrice} ₽</p>
        </div>
      </div>
    </div>
  )
}
