'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

import debounce from 'lodash.debounce'

import type { CartItem } from '@/types/cart'

type CartState = { items: CartItem[] };

type CartContextValue = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'count' | 'id'> & { count?: number }) => void;
    updateItem: (id: string, patch: Partial<Omit<CartItem, 'id'>>) => void;
    removeItem: (id: string) => void;
    clear: () => void;
    getTotalCount: () => number;
    serializeForCheckout: () => Omit<CartItem, 'id'>[];
};

const CART_LOCAL_STORAGE_KEY = 'cart_data'
const SAVE_DEBOUNCE_MILLISECONDS = 200

export const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => {
    throw new Error('CartContext: addItem called outside of CartProvider')
  },
  updateItem: () => {
    throw new Error('CartContext: updateItem called outside of CartProvider')
  },
  removeItem: () => {
    throw new Error('CartContext: removeItem called outside of CartProvider')
  },
  clear: () => {
    throw new Error('CartContext: clear called outside of CartProvider')
  },
  getTotalCount: () => {
    throw new Error('CartContext: getTotalCount called outside of CartProvider')
  },
  serializeForCheckout: () => {
    throw new Error('CartContext: serializeForCheckout called outside of CartProvider')
  },
})

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeArray(inputArray?: string[] | null) {
  if (!inputArray || inputArray.length === 0) return ''

  return [...inputArray].sort().join('|')
}

function getItemSignature(item: Partial<CartItem>) {
  return `${item.name}::${item.sectionId}::addons:${normalizeArray(item.addons)}::removed:${normalizeArray(item.removedIngredients)}`
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>(() => {
    if (typeof window === 'undefined') return { items: [] }

    try {
      const rawData = localStorage.getItem(CART_LOCAL_STORAGE_KEY)

      if (!rawData) return { items: [] }
      const parsedData = JSON.parse(rawData) as CartState

      parsedData.items = parsedData.items.map(item => ({
        ...item,
        id: item.id ?? generateId(),
      }))

      return parsedData
    } catch {
      return { items: [] }
    }
  })

  const saveToStorage = useMemo(
    () =>
      debounce((currentState: CartState) => {
        try {
          localStorage.setItem(CART_LOCAL_STORAGE_KEY, JSON.stringify(currentState))
        } catch (error) {
          throw new Error(`Failed to save cart ${error}`)
        }
      }, SAVE_DEBOUNCE_MILLISECONDS),
    []
  )

  useEffect(() => {
    saveToStorage(state)
  }, [state, saveToStorage])

  useEffect(() => {
    function handleStorageEvent(event: StorageEvent) {
      if (event.key !== CART_LOCAL_STORAGE_KEY) return

      try {
        if (!event.newValue) {
          setState({ items: [] })

          return
        }
        const parsedData = JSON.parse(event.newValue) as CartState

        setState(parsedData)
      } catch {}
    }
    window.addEventListener('storage', handleStorageEvent)

    return () => window.removeEventListener('storage', handleStorageEvent)
  }, [])

  function findMatchingItemIndex(items: CartItem[], candidateItem: Partial<CartItem>) {
    const signature = getItemSignature(candidateItem)

    return items.findIndex(item => getItemSignature(item) === signature)
  }

  const addItem = (newItemData: Omit<CartItem, 'count' | 'id'> & { count?: number }) => {
    const countToAdd = newItemData.count ?? 1

    setState(previousState => {
      const matchingIndex = findMatchingItemIndex(previousState.items, newItemData)

      if (matchingIndex >= 0) {
        const updatedItems = [...previousState.items]

        updatedItems[matchingIndex] = {
          ...updatedItems[matchingIndex],
          count: updatedItems[matchingIndex].count + countToAdd,
        }

        return { items: updatedItems }
      }
      const newItem: CartItem = {
        id: generateId(),
        name: newItemData.name,
        sectionId: newItemData.sectionId,
        description: newItemData.description ?? '',
        imageUrl: newItemData.imageUrl ?? '',
        count: countToAdd,
        cost: newItemData.cost,
        variant: newItemData.variant,
        removedIngredients: newItemData.removedIngredients ?? [],
        addons: newItemData.addons ?? [],
      }

      return { items: [...previousState.items, newItem] }
    })
  }

  const updateItem = (itemId: string, updates: Partial<Omit<CartItem, 'id'>>) => {
    setState(previousState => {
      const itemIndex = previousState.items.findIndex(item => item.id === itemId)

      if (itemIndex < 0) return previousState
      const updatedItems = [...previousState.items]

      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        ...updates,
      }

      // if count <=0 remove
      if (updatedItems[itemIndex].count <= 0) {
        updatedItems.splice(itemIndex, 1)
      }

      return { items: updatedItems }
    })
  }

  const removeItem = (itemId: string) => {
    setState(previousState => ({ items: previousState.items.filter(item => item.id !== itemId) }))
  }

  const clear = () => setState({ items: [] })

  const getTotalCount = () => state.items.reduce((total, item) => total + item.count, 0)

  const serializeForCheckout = (): Omit<CartItem, 'id'>[] => {
    return state.items.map(item => ({
      name: item.name,
      sectionId: item.sectionId,
      description: item.description,
      imageUrl: item.imageUrl,
      count: item.count,
      cost: item.cost,
      variant: item.variant,
      removedIngredients: item.removedIngredients,
      addons: item.addons,
    }))
  }

  const contextValue: CartContextValue = {
    items: state.items,
    addItem,
    updateItem,
    removeItem,
    clear,
    getTotalCount,
    serializeForCheckout,
  }

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
