'use client'

import { Button } from './../button/Button'
import { cleanDescription, normalizePrice } from './../utils'
import styles from './ProductCard.module.scss'

import type { Product as ProductType, SectionSchema, ItemVariant } from './../types/menu'

function parsePrice(costString: string): number {
  const cleaned = costString.replace(/[^\d.,-]/g, '').replace(',', '.')
  const num = Number(cleaned)

  return Number.isFinite(num) ? num : 0
}

export function ProductCard<
  T extends ProductType = ProductType,
  S extends SectionSchema = SectionSchema
>(props: {
  product: T
  schema?: S
  onSelect: () => void
}) {
  const { product, onSelect } = props

  const cheapestVariant = product.data.reduce((currentCheapest: ItemVariant, variant: ItemVariant) => {
    const variantPrice = parsePrice(variant.cost)
    const cheapestPrice = parsePrice(currentCheapest.cost)

    return variantPrice < cheapestPrice ? variant : currentCheapest
  }, product.data[0])

  const minPrice = parsePrice(cheapestVariant.cost)
  const minPriceDisplay = normalizePrice(minPrice)

  return (
    <article onClick={onSelect} className={styles.card} aria-labelledby={`product-title-${product.id}`}>
      <div className={styles.media}>
        <img className={styles.image} src={product.imageUrl} alt={product.name} />
      </div>

      <div className={styles.body}>
        <h3 id={`product-title-${product.id}`} className={styles.title}>
          {product.name}
        </h3>

        <p className={styles.description}>{cleanDescription(product.description)}</p>

        <div className={styles.row}>
          <p className={styles.price}>от {minPriceDisplay}</p>

          <Button
            size="md"
            variant="primary"
            aria-label={`Выбрать ${product.name}`}
          >
            Выбрать
          </Button>
        </div>
      </div>
    </article>
  )
}
