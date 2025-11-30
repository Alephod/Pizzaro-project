export function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err)
}

export function resolveImageSrc(src?: string | null) {
  if (!src) return ''
  if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) return src
  if (typeof window !== 'undefined') return `${window.location.origin.replace(/\/$/, '')}/${src.replace(/^\/+/, '')}`
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

  return `${base.replace(/\/$/, '')}/${src.replace(/^\/+/, '')}`
}
export const normalizePrice = (price: number) => `${price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)} ₽`

export const cleanDescription = (text: string): string => {
  return text.replace(/\s*\[[xх]\]\s*/gi, '')
}

export const generateOrderId = () => {
  const characters = '0123456789'
  let result = ''

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return result
}
