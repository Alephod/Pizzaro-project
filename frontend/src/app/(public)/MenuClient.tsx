'use client'

import { useContext } from 'react'

import { ModalContext, ProductCard } from '@my-app/ui-library'

import { ConfigureProductModal } from '@/components/configure-product-modal/ConfigureProductModal'
import type { MenuSection, Product as AppProduct, SectionSchema as AppSchema } from '@/types/menu'

import styles from './Home.module.scss'

interface MenuClientProps {
  sections: MenuSection[]
}

export function MenuClient({ sections }: MenuClientProps) {
  const { openModal, closeModal } = useContext(ModalContext)

  return (
    <>
      {sections.map(section =>
        section.items.length === 0 ? null : (
          <section key={section.id} id={`section-${section.slug}`} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.name}</h2>

            <div className={styles.grid}>
              {section.items.map(product => (
                <ProductCard<AppProduct, AppSchema>
                  key={product.id}
                  product={product}
                  schema={section.schema}
                  onSelect={() => {
                    openModal(
                      <ConfigureProductModal product={product} schema={section.schema} onClose={closeModal} />
                    )
                  }}
                />
              ))}
            </div>
          </section>
        )
      )}
    </>
  )
}
