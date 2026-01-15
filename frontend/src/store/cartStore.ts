import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CartItemOptions = {
  size?: string
  color?: string
  custom?: any
}

export type CartItem = {
  id: string
  productId: number
  name: string
  unitPrice: number
  imageUrl: string
  quantity: number
  options?: CartItemOptions
}

type AddToCartPayload = {
  productId: number
  name: string
  unitPrice: number
  imageUrl: string
  quantity?: number
  options?: CartItemOptions
}

type CartState = {
  items: CartItem[]
  addItem: (payload: AddToCartPayload) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  clear: () => void
  totalQuantity: () => number
  subtotal: () => number
}

const stableStringify = (value: any) => {
  try {
    return JSON.stringify(value)
  } catch {
    return ''
  }
}

const buildKey = (payload: AddToCartPayload) => {
  const size = payload.options?.size || ''
  const color = payload.options?.color || ''
  const custom = payload.options?.custom ? stableStringify(payload.options.custom) : ''
  return `${payload.productId}__${size}__${color}__${custom}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (payload) => {
        const qty = Math.max(1, payload.quantity || 1)
        const key = buildKey(payload)
        set((state) => {
          const existing = state.items.find((x) => x.id === key)
          if (existing) {
            return {
              items: state.items.map((x) => (x.id === key ? { ...x, quantity: x.quantity + qty } : x)),
            }
          }
          return {
            items: [
              ...state.items,
              {
                id: key,
                productId: payload.productId,
                name: payload.name,
                unitPrice: payload.unitPrice,
                imageUrl: payload.imageUrl,
                quantity: qty,
                options: payload.options,
              },
            ],
          }
        })
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((x) => x.id !== id) }))
      },

      setQuantity: (id, quantity) => {
        const q = Math.max(1, quantity)
        set((state) => ({
          items: state.items.map((x) => (x.id === id ? { ...x, quantity: q } : x)),
        }))
      },

      clear: () => set({ items: [] }),

      totalQuantity: () => get().items.reduce((sum, x) => sum + x.quantity, 0),
      subtotal: () => get().items.reduce((sum, x) => sum + x.unitPrice * x.quantity, 0),
    }),
    {
      name: 'lyriczfashion_cart',
    }
  )
)
