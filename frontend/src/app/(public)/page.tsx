import clsx from 'clsx'

import { getMenuSections } from '@/lib/fetchMenu'

import styles from './Home.module.scss'
import { MenuClient } from './MenuClient'

export default async function HomePage() {
  const sections = await getMenuSections()

  return (
    <main className={clsx('container', styles.main)}>
      <h1 className={styles.title}>Меню</h1>

      {sections.length === 0 ? (
        <p>Секции не найдены.</p>
      ) : (<MenuClient sections={sections} />)}
    </main>
  )
}
