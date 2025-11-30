'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import type { FormEvent, ChangeEvent, MouseEvent } from 'react'

import { Button, Checkbox, Input, ModalContext } from '@my-app/ui-library'
import clsx from 'clsx'
import { RotateCw, Pencil } from 'lucide-react'
import Image from 'next/image'
import slugify from 'slugify'

import type { SectionData } from '@/types/menu'

import commonStyle from './CommonModal.module.scss'
import style from './SectionModal.module.scss'

interface OptionField {
    id: string;
    name: string;
    addons: Addon[];
    isNew?: boolean;
}

interface Addon {
    name: string;
    imageUrl: string;
    cost: string;
}

interface SectionModalProps {
    mode: 'add' | 'edit';
    initialData?: SectionData;
    onSubmit: (data: SectionData) => void;
}

type ValidationErrors = {
    name?: string;
    slug?: string;
    options?: Record<string, string>;
};

const availableAddonsList = [
  { name: 'Бекон', imageUrl: '/addons/bacon.png' },
  { name: 'Голубой сыр', imageUrl: '/addons/blue-cheese.png' },
  { name: 'Шампиньоны', imageUrl: '/addons/champignon.png' },
  { name: 'Моцарелла', imageUrl: '/addons/mozz.png' },
  { name: 'Томаты', imageUrl: '/addons/tomata.png' },
  { name: 'Маринованные огурцы', imageUrl: '/addons/pickles.png' },
  { name: 'Халапеньо', imageUrl: '/addons/jalapeno.png' },
  { name: 'Курица', imageUrl: '/addons/chiken.png' },
  { name: 'Чоризо', imageUrl: '/addons/chorizo.png' },
  { name: 'Пепперони', imageUrl: '/addons/pepperoni.png' },
  { name: 'Ветчина', imageUrl: '/addons/ham.png' },
  { name: 'Сахар', imageUrl: '/addons/sugar.png' },
  { name: 'Карамельный сироп', imageUrl: '/addons/caramel-syrup.png' },
  { name: 'Кокосовый сироп', imageUrl: '/addons/coconut-syrup.png' },
]

const AddonSelector: React.FC<{
    availableAddonsList: typeof availableAddonsList;
    currentAddons: Addon[];
    onSave: (addons: Addon[]) => void;
}> = ({ availableAddonsList, currentAddons, onSave }) => {
  const { closeModal } = useContext(ModalContext)
  const [localAddons, setLocalAddons] = useState<Addon[]>(currentAddons)
  const costInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  const toggleAddon = (addon: (typeof availableAddonsList)[number]) => {
    setLocalAddons(prevAddons => {
      const exists = prevAddons.find(item => item.name === addon.name)

      if (exists) {
        return prevAddons.filter(item => item.name !== addon.name)
      }
      const newAddons = [...prevAddons, { ...addon, cost: '' }]

      // Auto-focus the new cost input
      setTimeout(() => {
        const input = costInputRefs.current.get(addon.name)

        if (input) {
          input.focus()
        }
      }, 0)

      return newAddons
    })
  }

  const updateCost = (name: string, cost: string) => {
    if (/^\d*\.?\d*$/.test(cost)) {
      setLocalAddons(prevAddons => prevAddons.map(item => (item.name === name ? { ...item, cost } : item)))
    }
  }

  const handleConfirm = () => {
    onSave(localAddons.filter(item => item.cost && Number(item.cost) >= 0))
    closeModal()
  }

  const availableToChoose = availableAddonsList.filter(addon => !currentAddons.some(selected => selected.name === addon.name))

  return (
    <div className={clsx(commonStyle.form, style.addonSelector)}>
      <h3 className={commonStyle.title}>Добавки для текущего варианта</h3>
      {availableToChoose.length === 0 ? <p>Нет доступных добавок</p> : (
        <div className={style.addonWrapper}>

          {availableToChoose.map(addon => {
            const selectedAddon = localAddons.find(item => item.name === addon.name)
            const isSelected = !!selectedAddon

            return (
              <div key={addon.name} className={clsx(style.addonItem, isSelected && style.addonItemSelected)} onClick={() => toggleAddon(addon)}>
                <div>
                  <div className={style.addonInfo}>
                    <Image src={addon.imageUrl} alt={addon.name} width={50} height={50} />
                    <span className={style.addonName}>{addon.name}</span>
                  </div>

                  {isSelected && (
                    <>
                      <span>—</span>
                      <Input
                        className={style.priceInput}
                        placeholder="Цена"
                        value={selectedAddon?.cost ?? ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updateCost(addon.name, e.target.value)}
                        onClick={(e: MouseEvent<HTMLInputElement>) => e.stopPropagation()}
                        ref={(el: HTMLInputElement | null) => {
                          if (el) {
                            costInputRefs.current.set(addon.name, el)
                          } else {
                            costInputRefs.current.delete(addon.name)
                          }
                        }}
                      />
                    </>
                  )}
                </div>
                <Checkbox isChecked={isSelected} onToggle={() => toggleAddon(addon)} />
              </div>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '12px' }}>
        <Button size="md" variant="secondary" onClick={closeModal}>
                    Отмена
        </Button>
        <Button size="md" variant="primary" onClick={handleConfirm} disabled={localAddons.some(item => !item.cost || Number(item.cost) < 0)}>
                    Сохранить добавки
        </Button>
      </div>
    </div>
  )
}

export default function SectionModal({ mode, initialData, onSubmit }: SectionModalProps) {
  const { openModal } = useContext(ModalContext)
  const optionIdCounterRef = useRef(1)
  const generateId = () => `opt_${optionIdCounterRef.current++}`

  const [sectionName, setSectionName] = useState(initialData?.name ?? '')
  const [sectionSlug, setSectionSlug] = useState(initialData?.slug ?? '')
  const [isSlugManual, setIsSlugManual] = useState(false)

  const [optionFields, setOptionFields] = useState<OptionField[]>(() => {
    const initOptions = initialData?.schema.options ?? [{ name: 'Вариант 1', addons: [] }]

    return initOptions.map(opt => ({
      id: generateId(),
      name: opt.name,
      addons: opt.addons.map(a => ({ ...a, cost: a.cost ?? '' })),
      isNew: false,
    }))
  })

  const [selectedOptionId, setSelectedOptionId] = useState<string>(optionFields[0]?.id ?? '')
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null)

  const [newlyAddedOptionId, setNewlyAddedOptionId] = useState<string | null>(null)

  const currentOption = optionFields.find(o => o.id === selectedOptionId)

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    if (!isSlugManual) {
      setSectionSlug(slugify(sectionName, { lower: true, strict: true }))
    }
  }, [sectionName, isSlugManual])

  useEffect(() => {
    if (optionFields.length > 0 && !optionFields.some(o => o.id === selectedOptionId)) {
      setSelectedOptionId(optionFields[0].id)
    }
  }, [optionFields, selectedOptionId])

  useEffect(() => {
    if (!newlyAddedOptionId) return
    const timer = setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>(`input[data-option-id="${newlyAddedOptionId}"]`)

      if (el) el.focus()
    }, 10)

    return () => clearTimeout(timer)
  }, [newlyAddedOptionId])

  const validate = (): boolean => {
    const errors: ValidationErrors = {}

    if (!sectionName.trim()) errors.name = 'Название обязательно'
    if (!sectionSlug.trim()) errors.slug = 'Slug обязателен'

    const optErrors: Record<string, string> = {}

    if (optionFields.length === 0) {
      optErrors['__global'] = 'Должен быть хотя бы один вариант'
    } else {
      optionFields.forEach(o => {
        if (!o.name.trim()) optErrors[o.id] = 'Название варианта пустое'
        o.addons.forEach(a => {
          if (!a.cost || Number(a.cost) < 0) {
            optErrors[o.id] = optErrors[o.id] ? `${optErrors[o.id]}. Проверьте цены добавок` : 'Проверьте цены добавок'
          }
        })
      })
    }

    if (Object.keys(optErrors).length > 0) errors.options = optErrors

    setValidationErrors(errors)

    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const schema = {
      options: optionFields.map(o => ({
        name: o.name.trim(),
        addons: o.addons,
      })),
    }

    onSubmit({
      name: sectionName.trim(),
      slug: sectionSlug.trim(),
      schema,
    })
  }

  const handleAddOption = () => {
    const newId = generateId()
    const newOption: OptionField = {
      id: newId,
      name: '',
      addons: [],
      isNew: true,
    }

    setOptionFields(prevFields => [...prevFields, newOption])
    setSelectedOptionId(newId)
    setNewlyAddedOptionId(newId)
    setEditingOptionId(newId)
  }

  const updateAddons = (id: string, addons: Addon[]) => {
    setOptionFields(prevFields => prevFields.map(o => (o.id === id ? { ...o, addons } : o)))
  }

  const openAddonsForCurrent = () => {
    if (!currentOption) return

    openModal(
      <AddonSelector
        availableAddonsList={availableAddonsList}
        currentAddons={currentOption.addons}
        onSave={updatedAddons => {
          updateAddons(currentOption.id, updatedAddons)
        }}
      />
    )
  }

  const updateOptionName = (optionId: string, newName: string) => {
    setOptionFields(prev => prev.map(o => (o.id === optionId ? { ...o, name: newName } : o)))
    setValidationErrors(prev => {
      if (!prev.options) return prev
      const copy = { ...prev.options }

      delete copy[optionId]
      const hasKeys = Object.keys(copy).length > 0

      return hasKeys ? { ...prev, options: copy } : { ...prev, options: undefined }
    })
  }

  const removeOption = (optionId: string) => {
    setOptionFields(prev => prev.filter(o => o.id !== optionId))
    setValidationErrors(prev => {
      if (!prev.options) return prev
      const copy = { ...prev.options }

      delete copy[optionId]
      const hasKeys = Object.keys(copy).length > 0

      return hasKeys ? { ...prev, options: copy } : { ...prev, options: undefined }
    })
  }

  const stopEditing = (optionId: string) => {
    setOptionFields(prev => {
      const newPrev = [...prev]
      const index = newPrev.findIndex(o => o.id === optionId)

      if (index !== -1) {
        const opt = newPrev[index]

        if (opt.isNew && !opt.name.trim()) {
          newPrev.splice(index, 1)

          if (selectedOptionId === optionId && newPrev.length > 0) {
            setSelectedOptionId(newPrev[0].id)
          }
        } else {
          newPrev[index] = { ...opt, isNew: false }
        }
      }

      return newPrev
    })
    setEditingOptionId(null)
  }

  return (
    <form className={commonStyle.form} onSubmit={handleSubmit} noValidate>
      <h2 className={commonStyle.title}>{mode === 'add' ? 'Добавить раздел' : 'Редактировать раздел'}</h2>

      <div className={style.sectionFields}>
        <div className={commonStyle.field}>
          <Input
            placeholder="Название раздела"
            value={sectionName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSectionName(e.target.value)}
            error={!!validationErrors.name}
            errorMessage={validationErrors.name}
          />
        </div>
        <div className={commonStyle.field}>
          <Input
            placeholder="slug"
            value={sectionSlug}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSectionSlug(e.target.value)
              setIsSlugManual(true)
            }}
            error={!!validationErrors.slug}
            errorMessage={validationErrors.slug}
            rightAdornment={
              <RotateCw
                size={22}
                onClick={() => {
                  setSectionSlug(slugify(sectionName, { lower: true, strict: true }))
                  setIsSlugManual(false)
                }}
              />
            }
          />
        </div>
      </div>

      <h3 className={commonStyle.title}>Варианты</h3>
      <div className={style.options}>
        {optionFields.map(opt => {
          const optError = validationErrors.options?.[opt.id]
          const isEditing = editingOptionId === opt.id
          const isSelected = selectedOptionId === opt.id

          return (
            <div
              key={opt.id}
              className={clsx(style.option, isSelected && style.selected, optError ? style.optionError : '')}
              onClick={() => {
                if (!isEditing) {
                  setSelectedOptionId(opt.id)
                }
              }}
            >
              {isEditing ? (
                <Input
                  data-option-id={opt.id}
                  value={opt.name}
                  onChange={e => updateOptionName(opt.id, e.target.value)}
                  onBlur={() => stopEditing(opt.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      stopEditing(opt.id)
                    }
                  }}
                  autoFocus
                  size={Math.max(opt.name.length * 1.3 || 1)}
                  style={{ minWidth: '80px' }}
                />
              ) : (
                <span className={style.optionName}>{opt.name || 'Новый вариант'}</span>
              )}
              {!isEditing && (
                <Pencil
                  size={16}
                  onClick={(e: MouseEvent<SVGSVGElement>) => {
                    e.stopPropagation()
                    setEditingOptionId(opt.id)
                  }}
                />
              )}
              <button
                type="button"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  removeOption(opt.id)
                }}
              >
                                ✕
              </button>
            </div>
          )
        })}
        <span className={style.optionAdd} onClick={handleAddOption}>
                    + Добавить
        </span>
        {validationErrors.options && (
          <div style={{ color: 'var(--danger)', fontSize: '14px' }}>
            {validationErrors.options?.['__global'] && <div>{validationErrors.options['__global']}</div>}
            {Object.keys(validationErrors.options ?? {}).some(k => k !== '__global' && validationErrors.options?.[k]) && <div>Все варианты должны быть заполнены</div>}
          </div>
        )}
      </div>

      {currentOption && (
        <div className={style.currentOptionEditor}>
          <h4 style={{ margin: '0 0 15px' }}>Добавки для «{currentOption.name || ''}»</h4>
          <div className={style.options}>
            {currentOption.addons.map(addon => (
              <div key={addon.name} className={style.option}>
                <Image src={addon.imageUrl} alt="" width={30} height={30} />
                <span>{addon.name}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 500 }}>+{addon.cost} ₽</span>
                <button
                  type="button"
                  onClick={() => {
                    updateAddons(
                      currentOption.id,
                      currentOption.addons.filter(a => a.name !== addon.name)
                    )
                  }}
                >
                                    ✕
                </button>
              </div>
            ))}
            <span className={style.optionAdd} onClick={openAddonsForCurrent}>
                            + Добавить добавку
            </span>
          </div>
        </div>
      )}

      <div className={commonStyle.footer}>
        <Button type="submit" size="md" variant="primary">
          {mode === 'add' ? 'Создать раздел' : 'Сохранить'}
        </Button>
      </div>
    </form>
  )
}
