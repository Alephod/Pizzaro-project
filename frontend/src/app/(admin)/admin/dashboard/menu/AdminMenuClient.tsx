'use client'
import { useContext, useState } from 'react'
import React from 'react'

import { Button, ModalContext, useInfoModal, AdminProductCard } from '@my-app/ui-library'
import clsx from 'clsx'
import { Pencil, Plus, Save, Trash2 } from 'lucide-react'

import type { MenuSection, SectionData, SectionSchema, Product, ItemVariant } from '@/types/menu'
import { getErrorMessage } from '@/utils'

import style from './AdminMenu.module.scss'
import ProductModal from './ProductModal'
import SectionModal from './SectionModal'

import type { ItemData } from './ProductModal'

interface Props {
    sectionsData: MenuSection[];
}

export default function AdminMenuClient({ sectionsData }: Props) {
  const { openModal, closeModal } = useContext(ModalContext)
  const { showInfo } = useInfoModal()

  const [sections, setSections] = useState<MenuSection[]>(sectionsData)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [backupSections, setBackupSections] = useState<MenuSection[] | null>(null)
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<number>>(new Set())

  // pending queues
  const [pendingSectionsCreate, setPendingSectionsCreate] = useState<MenuSection[]>([])
  const [pendingSectionsUpdate, setPendingSectionsUpdate] = useState<Record<number, SectionData>>({})
  const [pendingSectionsDeleteIds, setPendingSectionsDeleteIds] = useState<number[]>([])

  const [pendingProductsCreate, setPendingProductsCreate] = useState<Product[]>([])
  const [pendingProductsUpdate, setPendingProductsUpdate] = useState<Record<number, Partial<Product>>>({})
  const [pendingProductsDeleteIds, setPendingProductsDeleteIds] = useState<number[]>([])

  const startEditing = () => {
    setBackupSections(JSON.parse(JSON.stringify(sections)))
    setIsEditing(true)
  }

  // helper: upload data URL if needed -> returns relative URL or original
  async function uploadDataUrlIfNeeded(maybeDataUrl: string): Promise<string> {
    if (!maybeDataUrl) return ''
    const val = maybeDataUrl.trim()

    if (!val) return ''
    if (val.startsWith('/temp-uploads/') || val.startsWith('/uploads/') || val.startsWith('/')) return val
    if (val.startsWith('http://') || val.startsWith('https://')) return val

    if (val.startsWith('data:')) {
      try {
        const res = await fetch(val)
        const blob = await res.blob()
        const ext = (blob.type && blob.type.split('/')[1]) || 'png'
        const fileName = `upload-${Date.now()}.${ext}`
        const file = new File([blob], fileName, { type: blob.type })
        const fd = new FormData()

        fd.append('file', file)
        const upl = await fetch('/api/upload', { method: 'POST', body: fd })

        if (!upl.ok) throw new Error('Upload failed')
        const json = await upl.json()

        if (json && typeof json.url === 'string') return json.url

        return ''
      } catch (err) {
        void showInfo(`Ошибка при загрузке изображения: ${getErrorMessage(err)}`, 'Ошибка')

        return ''
      }
    }

    return val
  }

  // API helpers
  async function createSectionApi(payload: { name: string; slug: string; schema: SectionSchema; order?: number }) {
    return fetch('/api/menu-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to create section')

      return res.json() as Promise<MenuSection>
    })
  }

  async function updateSectionApi(id: number, payload: { name: string; slug: string; schema: SectionSchema; order?: number }) {
    const res = await fetch(`/api/menu-section/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error('Failed to update section')

    return (await res.json()) as MenuSection
  }

  async function deleteSectionApi(id: number) {
    const res = await fetch(`/api/menu-section/${id}`, { method: 'DELETE' })

    if (!res.ok) throw new Error('Failed to delete section')

    return res.json()
  }

  async function createProductApi(payload: { sectionId: number; name: string; description: string; imageUrl: string; data: ItemVariant[] | Record<string, unknown>; order?: number | null }) {
    const res = await fetch('/api/menu-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error('Failed to create product')

    return (await res.json()) as Product
  }

  async function updateProductApi(id: number, payload: { name: string; description: string; imageUrl: string; data: ItemVariant[] | Record<string, unknown>; order?: number | null }) {
    const res = await fetch(`/api/menu-product/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error('Failed to update product')

    return (await res.json()) as Product
  }

  async function deleteProductApi(id: number) {
    const res = await fetch(`/api/menu-product/${id}`, { method: 'DELETE' })

    if (!res.ok) throw new Error('Failed to delete product')

    return res.json()
  }

  const saveChanges = async () => {
    setIsSaving(true)

    try {
      const tempToReal = new Map<number, number>()

      // 1) create sections
      for (const sec of pendingSectionsCreate) {
        const payload = { name: sec.name, slug: sec.slug, schema: sec.schema ?? { options: [] }, order: sec.order ?? 999 }
        const created = await createSectionApi(payload)

        tempToReal.set(sec.id, created.id)
        // replace in local state
        setSections(prev => prev.map(s => (s.id === sec.id ? { ...s, id: created.id, createdAt: created.createdAt, updatedAt: created.updatedAt } : s)))
      }

      // 2) update sections
      const updateSecIds = Object.keys(pendingSectionsUpdate).map(k => parseInt(k, 10))

      for (const id of updateSecIds) {
        const payload = pendingSectionsUpdate[id]
        const updated = await updateSectionApi(id, {
          name: payload.name,
          slug: payload.slug,
          schema: payload.schema ?? { options: [] },
          order: payload.order,
        })

        setSections(prev => prev.map(s => (s.id === updated.id ? { ...s, ...updated } : s)))
      }

      // 3) delete sections
      for (const id of pendingSectionsDeleteIds) {
        await deleteSectionApi(id)
        setSections(prev => prev.filter(s => s.id !== id))
      }

      // 4) create products
      for (const p of pendingProductsCreate) {
        const realSectionId = tempToReal.get(p.sectionId) ?? p.sectionId
        const imageUrl = await uploadDataUrlIfNeeded(p.imageUrl ?? '')
        const created = await createProductApi({
          sectionId: realSectionId,
          name: p.name,
          description: p.description ?? '',
          imageUrl,
          data: p.data ?? [],
          order: p.order ?? 999,
        })

        // replace temp product in state
        setSections(prev =>
          prev.map(s =>
            s.id === realSectionId
              ? {
                ...s,
                items: [...(s.items ?? []).filter(i => i.id !== p.id), created],
              }
              : s
          )
        )
      }

      // 5) update products
      const updateProdIds = Object.keys(pendingProductsUpdate).map(k => parseInt(k, 10))

      for (const id of updateProdIds) {
        const upd = pendingProductsUpdate[id]
        const imageUrl = upd.imageUrl ? await uploadDataUrlIfNeeded(upd.imageUrl as string) : (upd.imageUrl as string | undefined) ?? ''
        const updated = await updateProductApi(id, {
          name: (upd.name as string) ?? '',
          description: (upd.description as string) ?? '',
          imageUrl,
          data: (upd.data as ItemVariant[]) ?? [],
          order: upd.order ?? undefined,
        })

        setSections(prev => prev.map(s => (s.id === updated.sectionId ? { ...s, items: s.items.map(i => (i.id === updated.id ? updated : i)) } : s)))
      }

      // 6) delete products
      for (const id of pendingProductsDeleteIds) {
        await deleteProductApi(id)
        setSections(prev => prev.map(s => ({ ...s, items: s.items.filter(i => i.id !== id) })))
      }

      // cleaning temp dir
      try {
        const res = await fetch('/api/cleanup-temp', { method: 'POST' })

        if (!res.ok) {
          const txt = await res.text().catch(() => 'unknown')

          void showInfo(`Не удалось очистить временные файлы: ${txt}`, 'Внимание')
        }
      } catch (err) {
        void showInfo(`Ошибка при очистке временных файлов: ${getErrorMessage(err)}`, 'Внимание')
      }

      // clear pending
      setPendingSectionsCreate([])
      setPendingSectionsUpdate({})
      setPendingSectionsDeleteIds([])
      setPendingProductsCreate([])
      setPendingProductsUpdate({})
      setPendingProductsDeleteIds([])

      // finish editing
      setIsEditing(false)
      setBackupSections(null)

      await showInfo('Изменения успешно сохранены', 'Готово')
    } catch (err) {
      await showInfo(`Ошибка при сохранении: ${getErrorMessage(err)}`, 'Ошибка')
    } finally {
      setIsSaving(false)
    }
  }

  const cancelChanges = async () => {
    if (backupSections) {
      setSections(JSON.parse(JSON.stringify(backupSections)))
    }

    try {
      const res = await fetch('/api/cleanup-temp', { method: 'POST' })

      if (!res.ok) {
        const txt = await res.text().catch(() => 'unknown')

        void showInfo(`Не удалось очистить временные файлы: ${txt}`, 'Внимание')
      }
    } catch (err) {
      void showInfo(`Ошибка при очистке временных файлов: ${getErrorMessage(err)}`, 'Внимание')
    }

    // clear pending
    setPendingSectionsCreate([])
    setPendingSectionsUpdate({})
    setPendingSectionsDeleteIds([])
    setPendingProductsCreate([])
    setPendingProductsUpdate({})
    setPendingProductsDeleteIds([])

    setIsEditing(false)
    setBackupSections(null)
  }

  const toggleSectionCollapse = (sectionId: number) => {
    const newCollapsedIds = new Set(collapsedSectionIds)

    if (newCollapsedIds.has(sectionId)) newCollapsedIds.delete(sectionId)
    else newCollapsedIds.add(sectionId)
    setCollapsedSectionIds(newCollapsedIds)
  }

  const handleOpenSectionModal = (mode: 'add' | 'edit', section?: MenuSection, insertIndex?: number) => {
    openModal(
      <SectionModal
        mode={mode}
        initialData={section ? { name: section.name, slug: section.slug, schema: section.schema ?? { options: [] } } : undefined}
        onSubmit={(data: SectionData) => {
          const now = new Date().toISOString()

          if (mode === 'add') {
            const newSection: MenuSection = {
              ...data,
              id: Math.floor(Math.random() * 1000000),
              items: [],
              createdAt: now,
              updatedAt: now,
              order: 0,
            }

            setSections(prev => {
              const updatedSections = [...prev]
              const effectiveInsertIndex = insertIndex ?? updatedSections.length

              updatedSections.splice(effectiveInsertIndex, 0, newSection)

              return updatedSections.map((sec, idx) => ({ ...sec, order: idx }))
            })
            setPendingSectionsCreate(prev => [...prev, newSection])
          } else if (mode === 'edit' && section) {
            setSections(prev => prev.map(s => (s.id === section.id ? { ...s, ...data, updatedAt: now } : s)))

            if (pendingSectionsCreate.some(p => p.id === section.id)) {
              setPendingSectionsCreate(prev => prev.map(p => (p.id === section.id ? { ...p, ...data, updatedAt: now } : p)))
            } else {
              setPendingSectionsUpdate(prev => ({ ...prev, [section.id]: data }))
            }
          }
          closeModal()
        }}
      />
    )
  }

  const itemToFormData = (item: Product): ItemData => ({
    name: item.name,
    description: item.description ?? '',
    imageUrl: item.imageUrl ?? '',
    order: item.order ?? sections.find(s => s.id === item.sectionId)?.items.length ?? 0,
    data: item.data,
  })

  const handleAddItem = (section: MenuSection) => {
    openModal(
      <ProductModal
        mode="add"
        section={section}
        onSubmit={itemData => {
          const now = new Date().toISOString()
          const newItem: Product = {
            id: Date.now(),
            sectionId: section.id,
            name: itemData.name,
            description: itemData.description ?? '',
            imageUrl: itemData.imageUrl ?? '',
            order: itemData.order ?? null,
            data: itemData.data,
            createdAt: now,
            updatedAt: now,
          }

          setSections(prev => prev.map(s => (s.id === section.id ? { ...s, items: [...(s.items ?? []), newItem] } : s)))
          setPendingProductsCreate(prev => [...prev, newItem])
          closeModal()
        }}
      />
    )
  }

  const handleEditItem = (section: MenuSection, item: Product) => {
    openModal(
      <ProductModal
        section={section}
        mode="edit"
        itemData={itemToFormData(item)}
        onSubmit={(itemData: ItemData) => {
          const now = new Date().toISOString()
          const updatedItem: Product = {
            ...item,
            name: itemData.name,
            description: itemData.description ?? '',
            imageUrl: itemData.imageUrl ?? '',
            order: itemData.order ?? item.order,
            data: itemData.data,
            updatedAt: now,
          }

          setSections(prev => prev.map(s => (s.id === section.id ? { ...s, items: s.items.map(i => (i.id === item.id ? updatedItem : i)) } : s)))

          if (pendingProductsCreate.some(p => p.id === item.id)) {
            setPendingProductsCreate(prev => prev.map(p => (p.id === item.id ? updatedItem : p)))
          } else {
            setPendingProductsUpdate(prev => ({ ...prev, [item.id]: updatedItem }))
          }
          closeModal()
        }}
      />
    )
  }

  const handleViewItem = (section: MenuSection, item: Product) => {
    openModal(<ProductModal section={section} mode="view" itemData={itemToFormData(item)} />)
  }

  const handleDeleteItem = (sectionId: number, itemId: number) => {
    setSections(prev => prev.map(s => (s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s)))

    if (pendingProductsCreate.some(p => p.id === itemId)) {
      setPendingProductsCreate(prev => prev.filter(p => p.id !== itemId))
    } else {
      setPendingProductsDeleteIds(prev => Array.from(new Set([...prev, itemId])))
      setPendingProductsUpdate(prev => {
        const copy = { ...prev }

        delete copy[itemId]

        return copy
      })
    }
  }

  async function handleDeleteSection(sectionId: number) {
    setSections(prev => prev.filter(s => s.id !== sectionId))

    if (pendingSectionsCreate.some(s => s.id === sectionId)) {
      setPendingSectionsCreate(prev => prev.filter(s => s.id !== sectionId))
    } else {
      setPendingSectionsDeleteIds(prev => Array.from(new Set([...prev, sectionId])))
      setPendingSectionsUpdate(prev => {
        const copy = { ...prev }

        delete copy[sectionId]

        return copy
      })
    }

    setPendingProductsCreate(prev => prev.filter(p => p.sectionId !== sectionId))
    setPendingProductsUpdate(prev => {
      const copy = { ...prev }

      for (const key of Object.keys(copy)) {
        const pid = parseInt(key, 10)
        const maybe = copy[pid] as Partial<Product> | undefined

        if (maybe && maybe.sectionId === sectionId) delete copy[pid]
      }

      return copy
    })
  }

  return (
    <main className={clsx('container', style.main)}>
      <div className={style.mainWrapper}>
        <div className={style.header}>
          <h1>Меню</h1>
          {isEditing ? (
            <div className={style.actions}>
              <Button loading={isSaving} disabled={isSaving} size="md" variant="primary" onClick={saveChanges}>
                {!isSaving && <Save size={20} />} Сохранить
              </Button>
              <Button size="md" variant="secondary" onClick={cancelChanges}>
                                Отменить
              </Button>
            </div>
          ) : (
            <Button size="md" variant="primary" onClick={startEditing}>
              <Pencil size={20} /> Редактировать
            </Button>
          )}
        </div>

        {sections.length === 0 ? (
          !isEditing ? (
            <div className={style.noSections}>Нет разделов в меню</div>
          ) : (
            <div className={style.addSection}>
              <Button style={{'borderRadius': '30px', 'backgroundColor': 'var(--background)'}} size="sm" variant="secondary" className={clsx(style.addSectionBtn, style.lastAddSectionBtn)} onClick={() => handleOpenSectionModal('add', undefined, 0)}>
                <Plus size={16} /> Добавить раздел
              </Button>
            </div>
          )
        ) : (
          <>
            {isEditing && (
              <div className={style.addSection}>
                <Button size="sm" variant="secondary" className={style.addSectionBtn} onClick={() => handleOpenSectionModal('add', undefined, 0)}>
                  <Plus size={16} /> Добавить раздел
                </Button>
              </div>
            )}

            {sections.map((section, index) => {
              const isCollapsed = collapsedSectionIds.has(section.id)

              return (
                <React.Fragment key={section.id}>
                  <div className={style.sectionWrapper}>
                    <div className={style.sectionHeader}>
                      <h2 onClick={() => toggleSectionCollapse(section.id)} className={style.sectionTitle}>
                        {section.name}
                      </h2>
                      <button className={clsx(style.toggleArrow, { [style.expanded]: !isCollapsed })} onClick={() => toggleSectionCollapse(section.id)}>
                        <svg width="18" height="9" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 7.25012L8.79487 1.25012L17 7.25012" stroke="black" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                      {isEditing && (
                        <div className={style.sectionActions}>
                          <span className={style.sectionEdit} onClick={() => handleOpenSectionModal('edit', section)}>
                            <Pencil size={20} /> Редактировать
                          </span>
                          <span
                            className={style.sectionDelete}
                            onClick={async () => {
                              void handleDeleteSection(section.id)
                            }}
                          >
                            <Trash2 size={20} /> Удалить
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={clsx(style.productsWrapper, { [style.collapsed]: isCollapsed })}>
                      <div className={style.products}>
                        {section.items.map(item => (
                          <AdminProductCard
                            key={item.id}
                            item={item}
                            isEditing={isEditing}
                            onEdit={isEditing ? () => handleEditItem(section, item) : undefined}
                            onDelete={isEditing ? () => handleDeleteItem(section.id, item.id) : undefined}
                            onView={!isEditing ? () => handleViewItem(section, item) : undefined}
                          />
                        ))}

                        {isEditing && (
                          <div className={style.addProduct} onClick={() => handleAddItem(section)}>
                            <Plus size={34} /> Добавить
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className={style.addSection}>
                      <Button
                        size="sm"
                        variant="secondary"
                        className={clsx(style.addSectionBtn, index === sections.length - 1 ? style.lastAddSectionBtn : '')}
                        onClick={() => handleOpenSectionModal('add', undefined, index + 1)}
                      >
                        <Plus size={16} /> Добавить раздел
                      </Button>
                    </div>
                  ) : (
                    index !== sections.length - 1 && <div className={style.addSection}></div>
                  )}
                </React.Fragment>
              )
            })}
          </>
        )}
      </div>
    </main>
  )
}