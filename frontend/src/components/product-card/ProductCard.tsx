'use client'

import React, { useContext } from 'react'

import { Button, ModalContext } from '@my-app/ui-library'
import Image from 'next/image'

import { ConfigureProductModal } from '@/components/configure-product-modal/ConfigureProductModal'
import type { Product, SectionSchema } from '@/types/menu'
import { cleanDescription, normalizePrice } from '@/utils'

import styles from './ProductCard.module.scss'

export interface ProductCardProps {
    product: Product;
    schema: SectionSchema;
}

function parsePrice(costString: string): number {
  const cleaned = costString.replace(/[^\d.,-]/g, '').replace(',', '.')
  const num = Number(cleaned)

  return Number.isFinite(num) ? num : 0
}

export function ProductCard({ product, schema }: ProductCardProps) {
  const { openModal, closeModal } = useContext(ModalContext)

  // Находим самый дешёвый вариант
  const cheapestVariant = product.data.reduce((cheapest, variant) => {
    const price = parsePrice(variant.cost)
    const cheapestPrice = parsePrice(cheapest.cost)

    return price < cheapestPrice ? variant : cheapest
  })

  const minPrice = parsePrice(cheapestVariant.cost)
  const minPriceDisplay = normalizePrice(minPrice)

  // Открытие модалки для полной настройки
  const handleOpenModal = () => {
    const handleClose = () => {
      closeModal()
    }

    openModal(<ConfigureProductModal schema={schema} product={product} onClose={handleClose} />)
  }

  return (
    <article className={styles.card} onClick={handleOpenModal} aria-labelledby={`product-title-${product.id}`}>
      <div className={styles.media}>
        <Image fill className={styles.image} src={product.imageUrl} alt={product.name} />
      </div>

      <div className={styles.body}>
        <h3 id={`product-title-${product.id}`} className={styles.title}>
          {product.name}
        </h3>

        <p className={styles.description}>{cleanDescription(product.description)}</p>

        <div className={styles.row}>
          <p className={styles.price}>от {minPriceDisplay}</p>

          <Button size="md" variant="primary" aria-label={`Выбрать ${product.name}`}>
                        Выбрать
          </Button>
        </div>
      </div>
    </article>
  )
}
