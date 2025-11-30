import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  const defaultProps = {
    isChecked: false,
    onToggle: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('рендерит чекбокс без лейбла', () => {
    render(<Checkbox {...defaultProps} />)
    const checkboxElement = screen.getByRole('checkbox')

    expect(checkboxElement).toBeInTheDocument()
  })

  it('рендерит чекбокс с лейблом', () => {
    render(<Checkbox {...defaultProps} label="Согласен с условиями" />)
    expect(screen.getByText('Согласен с условиями')).toBeInTheDocument()
  })

  it('применяет кастомный className', () => {
    render(<Checkbox {...defaultProps} className="my-custom-class" />)
    const checkboxElement = screen.getByRole('checkbox')

    expect(checkboxElement).toHaveClass('my-custom-class')
  })

  it('отображает галочку когда isChecked === true', () => {
    render(<Checkbox {...defaultProps} isChecked />)
    const checkboxElement = screen.getByRole('checkbox')
    const checkIcon = checkboxElement.querySelector('svg')

    expect(checkIcon).toBeInTheDocument()
  })

  it('вызывает onToggle при клике, если не disabled', async () => {
    const user = userEvent.setup()
    const handleToggle = jest.fn()

    render(<Checkbox {...defaultProps} onToggle={handleToggle} />)

    const checkboxElement = screen.getByRole('checkbox')

    await user.click(checkboxElement)

    expect(handleToggle).toHaveBeenCalledTimes(1)
  })

  it('НЕ вызывает onToggle при клике, если isDisabled === true', async () => {
    const user = userEvent.setup()
    const handleToggle = jest.fn()

    render(<Checkbox {...defaultProps} isDisabled onToggle={handleToggle} />)

    const checkboxElement = screen.getByRole('checkbox')

    await user.click(checkboxElement)

    expect(handleToggle).not.toHaveBeenCalled()
  })

  it('вызывает onToggle по нажатию Enter', async () => {
    const user = userEvent.setup()
    const handleToggle = jest.fn()

    render(<Checkbox {...defaultProps} onToggle={handleToggle} />)

    const checkboxElement = screen.getByRole('checkbox')

    checkboxElement.focus()
    await user.keyboard('{Enter}')

    expect(handleToggle).toHaveBeenCalledTimes(1)
  })

  it('вызывает onToggle по нажатию пробела', async () => {
    const user = userEvent.setup()
    const handleToggle = jest.fn()

    render(<Checkbox {...defaultProps} onToggle={handleToggle} />)

    const checkboxElement = screen.getByRole('checkbox')

    checkboxElement.focus()
    await user.keyboard(' ')

    expect(handleToggle).toHaveBeenCalledTimes(1)
  })

  it('НЕ вызывает onToggle по клавишам, если disabled', async () => {
    const user = userEvent.setup()
    const handleToggle = jest.fn()

    render(<Checkbox {...defaultProps} isDisabled onToggle={handleToggle} />)

    const checkboxElement = screen.getByRole('checkbox')

    checkboxElement.focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')

    expect(handleToggle).not.toHaveBeenCalled()
  })

  it('устанавливает корректные ARIA атрибуты', () => {
    const { rerender } = render(<Checkbox {...defaultProps} isChecked={false} />)
    let checkboxElement = screen.getByRole('checkbox')

    expect(checkboxElement).toHaveAttribute('aria-checked', 'false')

    rerender(<Checkbox {...defaultProps} isChecked={true} isDisabled />)
    checkboxElement = screen.getByRole('checkbox')
    expect(checkboxElement).toHaveAttribute('aria-checked', 'true')
    expect(checkboxElement).toHaveAttribute('aria-disabled', 'true')
  })

  it('не фокусируется (tabIndex undefined) когда disabled', () => {
    render(<Checkbox {...defaultProps} isDisabled />)
    const checkboxElement = screen.getByRole('checkbox')

    expect(checkboxElement).not.toHaveAttribute('tabIndex')
  })

  it('фокусируется (tabIndex=0) когда не disabled', () => {
    render(<Checkbox {...defaultProps} />)
    const checkboxElement = screen.getByRole('checkbox')

    expect(checkboxElement).toHaveAttribute('tabIndex', '0')
  })

  it('останавливает всплытие события клика (stopPropagation)', async () => {
    const user = userEvent.setup()
    const handleParentClick = jest.fn()

    render(
      <div onClick={handleParentClick}>
        <Checkbox {...defaultProps} onToggle={jest.fn()} />
      </div>,
    )

    const checkboxElement = screen.getByRole('checkbox')

    await user.click(checkboxElement)

    expect(handleParentClick).not.toHaveBeenCalled()
  })
})