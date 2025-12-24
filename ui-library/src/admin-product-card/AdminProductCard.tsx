'use client'

import { Edit, Trash2 } from 'lucide-react'

import styles from './AdminProductCard.module.scss'

import type { Product } from './../types/menu' 

interface AdminProductCardProps {
  item: Product
  isEditing: boolean
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
}

export function AdminProductCard({ item, isEditing, onEdit, onDelete, onView }: AdminProductCardProps) {
  const costs = (item.data ?? [])
    .map(v => {
      const c = typeof v.cost === 'number' ? v.cost : parseFloat(String(v.cost ?? ''))

      return Number.isFinite(c) ? c : NaN
    })
    .filter(c => !Number.isNaN(c))

  const minCost = costs.length > 0 ? Math.min(...costs) : null
  const imageSrc = (item.imageUrl ?? '').trim() || '/placeholder.png'

  return (
    <div className={styles.card}>
      <img width={130} height={130} src={imageSrc} alt={item.name} className={styles.image} />
      <div className={styles.content}>
        <h3
          className={styles.name}
          onClick={!isEditing ? onView : undefined}
          style={{ cursor: !isEditing ? 'pointer' : 'default' }}
        >
          {item.name}
        </h3>

        {item.description ? <p className={styles.description}>{item.description}</p> : null}
        {minCost !== null && <p className={styles.price}>от {minCost}р</p>}
      </div>

      {isEditing && (
        <div className={styles.buttons}>
          <button type="button" onClick={onEdit} aria-label="Edit">
            <Edit size={20} />
          </button>

          <button type="button" onClick={onDelete} className={styles.deleteBtn} aria-label="Delete">
            <Trash2 size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminProductCard
