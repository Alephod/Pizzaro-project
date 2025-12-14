import { render, screen } from '@testing-library/react'
import useSWR from 'swr'

import type { OrderData } from '@/types/order'
import { normalizePrice } from '@/utils'

import OrderCard, { statusClass, itemsPreview, fetcher } from './OrderCard'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="order-link">
      {children}
    </a>
  ),
}))

jest.mock('@/utils', () => ({
  __esModule: true,
  normalizePrice: jest.fn((price: number) => `${price.toLocaleString('ru-RU')} ₽`),
}))

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}))

type UseSWRReturn = { data?: OrderData };

const mockUseSWR = jest.mocked(useSWR) as jest.MockedFunction<(...args: unknown[]) => UseSWRReturn>
const mockNormalizePrice = jest.mocked(normalizePrice) as jest.MockedFunction<(price: number) => string>

describe('OrderCard — тесты (строгая типизация, ESM моки)', () => {
  const baseOrder: OrderData = {
    id: 'ord_123',
    customerName: 'Иван Иванов',
    phone: '+79991234567',
    address: 'ул. Ленина, д. 5, кв. 12',
    deliveryTime: 'ASAP',
    paymentMethod: 'card',
    total: 2150,
    status: 'Готовится',
    createdAt: '2025-04-01T12:30:00.000Z',
    updatedAt: '2025-04-01T12:35:00.000Z',
    items: [
      {
        name: 'Пицца Пепперони',
        variant: 'Большая',
        count: 1,
        cost: 950,
        removedIngredients: ['лук'],
        addons: ['дополнительный сыр'],
      },
      { name: 'Кола 1л', count: 2, cost: 200 },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSWR.mockImplementation(() => ({ data: baseOrder }))
    mockNormalizePrice.mockImplementation((price) => `${price} ₽`)
  })

  it('отображает адрес и статус с правильным классом', () => {
    const { container } = render(<OrderCard order={baseOrder} />)

    expect(screen.getByText(baseOrder.address)).toBeInTheDocument()

    const statusEl = container.querySelector('.status')

    expect(statusEl).toBeInTheDocument()
    expect(statusEl).toHaveTextContent('Готовится')
    expect(statusEl?.className).toEqual(expect.stringContaining('statusPreparing'))
  })

  it.each([
    ['Принято', 'statusAccepted'],
    ['Готовится', 'statusPreparing'],
    ['Доставляется', 'statusDelivering'],
    ['Доставлено', 'statusDelivered'],
  ] as const)('статус "%s" → класс %s (через рендер)', (status, expectedClass) => {
    const order: OrderData = { ...baseOrder, status }

    mockUseSWR.mockImplementation(() => ({ data: order }))

    const { container } = render(<OrderCard order={order} />)

    const el = container.querySelector(`.${expectedClass}`)

    expect(el).toBeInTheDocument()
    expect(el).toHaveTextContent(status)
  })

  it('генерирует корректный превью товаров', () => {
    render(<OrderCard order={baseOrder} />)

    const preview = 'Пицца Пепперони · Большая - x1, Кола 1л - x2'

    expect(screen.getByText(preview)).toBeInTheDocument()
  })

  it('при пустых items превью пустое', () => {
    const order: OrderData = { ...baseOrder, items: [] }

    mockUseSWR.mockImplementation(() => ({ data: order }))

    const { container } = render(<OrderCard order={order} />)

    const previewEl = container.querySelector('.preview')

    expect(previewEl).toBeInTheDocument()
    expect(previewEl).toBeEmptyDOMElement()
  })

  it('форматирует дату создания в ru-RU (с ведущими нулями)', () => {
    render(<OrderCard order={baseOrder} />)

    const dateEl = screen.getByText((content) => /01\.04\.2025/.test(content))

    expect(dateEl).toBeInTheDocument()
  })

  it('отображает цену через normalizePrice', () => {
    render(<OrderCard order={baseOrder} />)

    expect(normalizePrice).toHaveBeenCalledWith(2150)
    expect(screen.getByText('2150 ₽')).toBeInTheDocument()
  })

  it('ссылка ведёт на правильный путь', () => {
    render(<OrderCard order={baseOrder} />)

    expect(screen.getByTestId('order-link')).toHaveAttribute('href', './order/ord_123')
  })

  it('приоритет у данных из SWR', () => {
    const freshOrder: OrderData = { ...baseOrder, status: 'Доставляется', total: 3000 }

    mockUseSWR.mockImplementation(() => ({ data: freshOrder }))

    const { container } = render(<OrderCard order={baseOrder} />)

    expect(container.querySelector('.statusDelivering')).toBeInTheDocument()
    expect(screen.getByText('3000 ₽')).toBeInTheDocument()
  })

  it('fallbackData используется, пока SWR грузится', () => {
    mockUseSWR.mockImplementation(() => ({ data: undefined }))

    render(<OrderCard order={baseOrder} />)

    expect(screen.getByText('Готовится')).toBeInTheDocument()
    expect(screen.getByText('2150 ₽')).toBeInTheDocument()
  })

  it('при изменении createdAt дата обновляется', () => {
    mockUseSWR.mockImplementation(() => ({ data: baseOrder }))
    const { rerender } = render(<OrderCard order={baseOrder} />)

    expect(screen.getByText((c) => /01\.04\.2025/.test(c))).toBeInTheDocument()

    const newOrder: OrderData = { ...baseOrder, createdAt: '2025-05-10T08:00:00.000Z' }

    mockUseSWR.mockImplementation(() => ({ data: newOrder }))

    rerender(<OrderCard order={baseOrder} />)
    expect(screen.getByText((c) => /10\.05\.2025/.test(c))).toBeInTheDocument()
  })

  it.each([
    ['Принято', 'statusAccepted'],
    ['Готовится', 'statusPreparing'],
    ['Доставляется', 'statusDelivering'],
    ['Доставлено', 'statusDelivered'],
  ] as const)('statusClass возвращает CSS-класс для статуса %s', (status, expectedClass) => {
    const cls = statusClass(status)

    // в Jest моки CSS-module обычно отображаются в виде имени ключа — проверяем наличие подстроки
    expect(cls).toEqual(expect.stringContaining(expectedClass))
  })

  it('statusClass для undefined возвращает пустую строку', () => {
    expect(statusClass(undefined)).toBe('')
  })

  it('itemsPreview корректно обрабатывает разные входные значения', () => {
    // обычный массив
    expect(itemsPreview(baseOrder.items)).toBe('Пицца Пепперони · Большая - x1, Кола 1л - x2')

    // пустой массив
    expect(itemsPreview([])).toBe('')

    // undefined / null / не-массив
    expect(itemsPreview(undefined)).toBe('')
    expect(itemsPreview(null)).toBe('')
  })

  it('fetcher делает fetch и возвращает распарсенный JSON', async () => {
    const fake: OrderData = { ...baseOrder, id: 'x1' }
    const mockJson = jest.fn().mockResolvedValue(fake)

    global.fetch = jest.fn().mockResolvedValue({ json: mockJson })

    const res = await fetcher('/api/orders/x1')

    expect(global.fetch).toHaveBeenCalledWith('/api/orders/x1')
    expect(mockJson).toHaveBeenCalled()
    expect(res).toEqual(fake)
  })
})
