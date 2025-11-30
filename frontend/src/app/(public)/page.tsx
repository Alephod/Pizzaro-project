import React from 'react'

import clsx from 'clsx'

import { ProductCard } from '@/components/product-card/ProductCard'
import { getMenuSections } from '@/lib/fetchMenu'

import styles from './Home.module.scss'

export default async function Home() {
  const sections = await getMenuSections()

  return (
    <main className={clsx('container', styles.main)}>
      <h1 className={styles.title}>Меню</h1>

      {sections.length === 0 ? (
        <p>Секции не найдены.</p>
      ) : (
        sections.map(section =>
          section.items.length !== 0 ? (
            <section key={section.id} id={`section-${section.slug}`} className={styles.section}>
              <h2 className={styles.sectionTitle}>{section.name}</h2>

              <div className={styles.grid}>
                {section.items.map(product => (
                  <ProductCard schema={section.schema} key={product.id} product={product} />
                ))}
              </div>
            </section>
          ) : null
        )
      )}
    </main>
  )
}
