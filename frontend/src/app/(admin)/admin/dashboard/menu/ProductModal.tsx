'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { Button, Input, PhotoUpload, RadioButton, Textarea } from '@my-app/ui-library'
import clsx from 'clsx'

import { useInfoModal } from '@/components/info-modal/InfoModal'
import type { MenuSection, ItemVariant } from '@/types/menu'
import { resolveImageSrc } from '@/utils'

import commonStyle from './CommonModal.module.scss'
import style from './ProductModal.module.scss'

export interface ItemData {
    name: string;
    description: string;
    imageUrl: string;
    order: number;
    data: ItemVariant[];
}

interface AddProductModalProps {
    section: MenuSection;
    mode: 'edit' | 'add' | 'view';
    itemData?: Partial<ItemData> | ItemData;
    onSubmit?: (data: ItemData) => void;
}

export default function ProductModal({ section, onSubmit, mode, itemData }: AddProductModalProps) {
  const { showInfo } = useInfoModal()
  const options = useMemo<string[]>(() => {
    return section?.schema?.options.map(opt => opt.name).filter((name): name is string => typeof name === 'string') ?? []
  }, [section])
  const defaultOption = useMemo(() => options[0] ?? '', [options])
  const itemDataVariants = useMemo<ItemVariant[]>(() => (Array.isArray(itemData?.data) ? (itemData.data as ItemVariant[]) : []), [itemData])

    type VariantMap = Record<string, { weight: string; kkal: string; cost: string }>;
    type VariantError = { weight?: string; kkal?: string; cost?: string };
    const makeEmptyVariant = () => ({ weight: '', kkal: '', cost: '' })
    const buildInitialVariants = useCallback<() => VariantMap>(() => {
      const initial: VariantMap = {}

      options.forEach(opt => {
        initial[opt] = makeEmptyVariant()
      })

      if (itemDataVariants && itemDataVariants.length) {
        itemDataVariants.forEach(d => {
          if (!d || typeof d.name !== 'string') return

          if (initial[d.name] !== undefined) {
            initial[d.name] = {
              weight: (d.weight as string) ?? '',
              kkal: (d.kkal as string) ?? '',
              cost: (d.cost as string) ?? '',
            }
          }
        })
      }

      return initial
    }, [options, itemDataVariants])
    const [name, setName] = useState<string>(itemData?.name ?? '')
    const [description, setDescription] = useState<string>(itemData?.description ?? '')
    const [photo, setPhoto] = useState<string>(itemData?.imageUrl ?? '')
    const [variantValues, setVariantValues] = useState<VariantMap>(() => buildInitialVariants())
    const [selectedOption, setSelectedOption] = useState<string>(defaultOption)
    // validation state
    const [errors, setErrors] = useState<{ name?: string; description?: string; photo?: string; variants?: Record<string, VariantError> }>({})

    useEffect(() => {
      setName(itemData?.name ?? '')
      setDescription(itemData?.description ?? '')
      setPhoto(itemData?.imageUrl ?? '')
      setVariantValues(buildInitialVariants())
      setSelectedOption(defaultOption)
      setErrors({})
    }, [section?.id, itemData?.name, itemData?.description, itemData?.imageUrl, buildInitialVariants, defaultOption])
    const isReadOnly = mode === 'view'

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]

      if (!file) return

      setErrors(prev => ({ ...prev, photo: undefined }))

      // Пытаемся загрузить на сервер
      try {
        const fd = new FormData()

        fd.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: fd,
        })

        if (res.ok) {
          const json = await res.json()

          if (json?.url && typeof json.url === 'string') {
            setPhoto(json.url)

            return
          }
        }
        throw new Error('Сервер не вернул ссылку на изображение')
      } catch {
        // Опционально: показываем пользователю, что загрузка не удалась, но фото всё равно будет
        void showInfo('Не удалось загрузить изображение на сервер. Фото будет сохранено локально (после сохранения товара — загрузится автоматически).', 'Загрузка временно недоступна')

        // Fallback: используем data URL
        const reader = new FileReader()

        reader.onload = () => {
          const result = reader.result as string

          if (result.startsWith('data:')) {
            setPhoto(result)
          }
        }

        reader.onerror = () => {
          setErrors(prev => ({ ...prev, photo: 'Не удалось прочитать файл' }))
        }
        reader.readAsDataURL(file)
      }
    }

    const handleDeletePhoto = () => {
      setPhoto('')
    }
    const handleVariantChange = (option: string, field: keyof VariantMap[string], value: string) => {
      setVariantValues(prev => ({
        ...prev,
        [option]: { ...prev[option], [field]: value },
      }))
      setErrors(prev => {
        if (prev.variants?.[option]?.[field]) {
          const copyVariants = { ...prev.variants }
          const copyOpt = { ...copyVariants[option] }

          delete copyOpt[field]

          if (Object.keys(copyOpt).length === 0) {
            delete copyVariants[option]
          } else {
            copyVariants[option] = copyOpt
          }

          if (Object.keys(copyVariants).length === 0) {
            return { ...prev, variants: undefined }
          } else {
            return { ...prev, variants: copyVariants }
          }
        }

        return prev
      })
    }
    const handleClear = () => {
      setName('')
      setDescription('')
      setPhoto('')
      setVariantValues(options.reduce((acc, opt) => ({ ...acc, [opt]: makeEmptyVariant() }), {} as VariantMap))
      setSelectedOption(defaultOption)
      setErrors({})
    }
    // helpers
    const isNumeric = (v: string) => /^-?\d*(\.\d+)?$/.test(v) && v.trim() !== ''
    const validate = () => {
      if (isReadOnly) return true
      const newErrors: typeof errors = {}

      if (!name.trim()) newErrors.name = 'Название не может быть пустым'
      if (!description.trim()) newErrors.description = 'Описание не может быть пустым'
      if (!photo) newErrors.photo = 'Фото не может быть пустым'
      const variantsErrors: Record<string, VariantError> = {}

      options.forEach(opt => {
        const sel = variantValues[opt] ?? makeEmptyVariant()
        const vErr: VariantError = {}

        if (!sel.weight?.trim()) vErr.weight = 'Вес не может быть пустым'
        if (!sel.kkal?.trim()) vErr.kkal = 'Ккал не может быть пустым'
        else if (!isNumeric(sel.kkal)) vErr.kkal = 'Ккал должно быть числом'
        if (!sel.cost?.trim()) vErr.cost = 'Цена не может быть пустой'
        else if (!isNumeric(sel.cost)) vErr.cost = 'Цена должна быть числом'
        if (Object.keys(vErr).length) variantsErrors[opt] = vErr
      })
      if (Object.keys(variantsErrors).length) newErrors.variants = variantsErrors
      setErrors(newErrors)

      return Object.keys(newErrors).length === 0
    }
    const focusFirstError = () => {
      if (errors.name) {
        const el = document.querySelector<HTMLInputElement>('input[placeholder="Название"]')

        el?.focus()

        return
      }

      if (errors.description) {
        const el = document.querySelector<HTMLTextAreaElement>('textarea[name="description"]')

        el?.focus()

        return
      }

      if (errors.photo) {
        const el = document.querySelector<HTMLInputElement>('input[type="file"]')

        el?.focus()

        return
      }

      if (errors.variants) {
        const optsWithErrors = Object.keys(errors.variants)

        if (optsWithErrors.length) {
          const firstOpt = optsWithErrors[0]

          setSelectedOption(firstOpt)
          setTimeout(() => {
            const weightInput = document.querySelector<HTMLInputElement>('input[placeholder="Вес (объем)"]')
            const kkalInput = document.querySelector<HTMLInputElement>('input[placeholder="Ккал"]')
            const costInput = document.querySelector<HTMLInputElement>('input[placeholder="Цена"]');

            (weightInput || kkalInput || costInput)?.focus()
          }, 100)
        }
      }
    }
    const handleSubmit = (e: FormEvent) => {
      e.preventDefault()
      if (isReadOnly) return

      if (!validate()) {
        setTimeout(focusFirstError, 0)

        return
      }
      const trimmedName = (name ?? '').trim()
      const formData: ItemData = {
        name: trimmedName,
        description: description ?? '',
        imageUrl: photo ?? '',
        order: mode === 'add' ? (section.items?.length ?? 0) + 1 : (itemData?.order as number) ?? (section.items?.length ?? 0) + 1,
        data: options.map(opt => ({
          name: opt,
          weight: variantValues[opt]?.weight ?? '',
          kkal: variantValues[opt]?.kkal ?? '',
          cost: variantValues[opt]?.cost ?? '',
        })) as ItemVariant[],
      }

      onSubmit?.(formData)
    }
    const handleKkalChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value

      if (newValue === '' || /^\d*(\.\d*)?$/.test(newValue)) {
        handleVariantChange(selectedOption, 'kkal', newValue)
      }
    }
    const handleCostChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value

      if (newValue === '' || /^\d*(\.\d*)?$/.test(newValue)) {
        handleVariantChange(selectedOption, 'cost', newValue)
      }
    }

    return (
      <form className={commonStyle.form} onSubmit={handleSubmit} noValidate>
        <h2 className={commonStyle.title}>{mode === 'add' ? 'Добавить позицию' : mode === 'edit' ? `Изменить ${itemData?.name ?? ''}` : `Просмотр ${itemData?.name ?? ''}`}</h2>
        <div className={style.sectionFields}>
          <div className={clsx(commonStyle.field)}>
            <Input
              placeholder="Название"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value)
                setErrors(prev => ({ ...prev, name: undefined }))
              }}
              type="text"
              disabled={isReadOnly}
              error={!!errors.name}
              errorMessage={errors.name}
            />
          </div>
          <div className={clsx(commonStyle.field, style.textarea)}>
            <Textarea
              className={style.text}
              name="description"
              placeholder="Описание"
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setDescription(e.target.value)
                setErrors(prev => ({ ...prev, description: undefined }))
              }}
              disabled={isReadOnly}
              error={!!errors.description}
              errorMessage={errors.description}
            />
          </div>
          <div className={clsx(commonStyle.field, style.photo)}>
            <PhotoUpload
              onChange={handleFileChange}
              label={isReadOnly ? undefined : 'Загрузите фото'}
              accept="image/*"
              preview={photo ? resolveImageSrc(photo) : null}
              onDelete={isReadOnly ? undefined : handleDeletePhoto}
              disabled={isReadOnly}
              error={!!errors.photo}
            />
          </div>
        </div>
        {options.length > 0 && (
          <>
            <div className={commonStyle.radioContainer}>
              <RadioButton options={options} selected={selectedOption} onChange={opt => setSelectedOption(opt)} />
            </div>
            <div className={style.variantInputs}>
              {selectedOption ? (
                <>
                  <Input
                    placeholder="Вес (объем)"
                    value={variantValues[selectedOption]?.weight || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleVariantChange(selectedOption, 'weight', e.target.value)}
                    type="text"
                    disabled={isReadOnly}
                    error={!!errors.variants?.[selectedOption]?.weight}
                    errorMessage={errors.variants?.[selectedOption]?.weight}
                  />
                  <Input
                    placeholder="Ккал"
                    value={variantValues[selectedOption]?.kkal || ''}
                    onChange={handleKkalChange}
                    type="text"
                    disabled={isReadOnly}
                    error={!!errors.variants?.[selectedOption]?.kkal}
                    errorMessage={errors.variants?.[selectedOption]?.kkal}
                  />
                  <Input
                    placeholder="Цена"
                    value={variantValues[selectedOption]?.cost || ''}
                    onChange={handleCostChange}
                    type="text"
                    disabled={isReadOnly}
                    error={!!errors.variants?.[selectedOption]?.cost}
                    errorMessage={errors.variants?.[selectedOption]?.cost}
                  />
                </>
              ) : (
                <div className={style.noOptions}>Нет доступных вариантов</div>
              )}
            </div>
          </>
        )}
        <div className={commonStyle.footer}>
          {mode !== 'view' && (
            <Button size="md" type="button" variant="secondary" onClick={handleClear} disabled={isReadOnly}>
                        Очистить всё
            </Button>
          )}
          {mode !== 'view' && (
            <Button size="md" type="submit" variant="primary">
              {mode === 'add' ? 'Добавить' : 'Сохранить'}
            </Button>
          )}
        </div>
      </form>
    )
}
