import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Button } from './Button'

describe('Button component', () => {
  it('renders the button with default props and children', () => {
    render(<Button size="md" variant="primary">Click Me</Button>)
    const buttonElement = screen.getByRole('button', { name: /Click Me/i })

    expect(buttonElement).toBeInTheDocument()
    expect(buttonElement).toHaveAttribute('type', 'button')
    expect(buttonElement).not.toBeDisabled()
  })

  it('renders the button with a custom className', () => {
    render(<Button size="md" variant="primary" className="custom-class">Click Me</Button>)
    const buttonElement = screen.getByRole('button', { name: /Click Me/i })

    expect(buttonElement).toHaveClass('custom-class')
  })

  it('renders the button as disabled when disabled prop is true', () => {
    render(<Button size="md" variant="primary" disabled>Click Me</Button>)
    const buttonElement = screen.getByRole('button', { name: /Click Me/i })

    expect(buttonElement).toBeDisabled()
  })

  it('renders the spinner and disables the button when loading prop is true', () => {
    render(<Button size="md" variant="primary" loading>Click Me</Button>)
    const buttonElement = screen.getByRole('button', { name: /Click Me/i })

    expect(buttonElement).toBeDisabled()
    const spinnerElement = buttonElement.querySelector('div') 

    expect(spinnerElement).toBeInTheDocument()
    expect(spinnerElement).toHaveClass('spinner') 
  })

  it('renders the button with submit type', () => {
    render(<Button size="md" variant="primary" type="submit">Submit</Button>)
    const buttonElement = screen.getByRole('button', { name: /Submit/i })

    expect(buttonElement).toHaveAttribute('type', 'submit')
  })

  it('renders the button with reset type', () => {
    render(<Button size="md" variant="primary" type="reset">Reset</Button>)
    const buttonElement = screen.getByRole('button', { name: /Reset/i })

    expect(buttonElement).toHaveAttribute('type', 'reset')
  })

  it('renders the button with different variants and sizes', () => {
    // Test primary sm
    const { rerender } = render(<Button size="sm" variant="primary">Primary Small</Button>)

    expect(screen.getByRole('button', { name: /Primary Small/i })).toBeInTheDocument()

    // Rerender for secondary md
    rerender(<Button size="md" variant="secondary">Secondary Medium</Button>)
    expect(screen.getByRole('button', { name: /Secondary Medium/i })).toBeInTheDocument()

    // Rerender for tertiary lg
    rerender(<Button size="lg" variant="tertiary">Tertiary Large</Button>)
    expect(screen.getByRole('button', { name: /Tertiary Large/i })).toBeInTheDocument()

    // Rerender for danger sm
    rerender(<Button size="sm" variant="danger">Danger Small</Button>)
    expect(screen.getByRole('button', { name: /Danger Small/i })).toBeInTheDocument()
  })

  it('handles click events when not disabled', async () => {
    const handleClick = jest.fn()

    render(<Button size="md" variant="primary" onClick={handleClick}>Click Me</Button>)
    const buttonElement = screen.getByRole('button', { name: /Click Me/i })

    await userEvent.click(buttonElement)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not handle click events when disabled', async () => {
    const handleClick = jest.fn()

    render(<Button size="md" variant="primary" disabled onClick={handleClick}>Click Me</Button>)
    const buttonElement = screen.getByRole('button', { name: /Click Me/i })

    await userEvent.click(buttonElement)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('does not show spinner when loading is false', () => {
    render(<Button size="md" variant="primary" loading={false}>Click Me</Button>)
    const buttonElement = screen.getByRole('button', { name: /Click Me/i })
    const spinnerElement = buttonElement.querySelector('div')

    expect(spinnerElement).not.toBeInTheDocument()
  })
})
jest.mock('./Button.module.scss', () => ({
  button: 'button',
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  danger: 'danger',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  spinner: 'spinner',
}))

describe('Button component', () => {
  test('renders children and has default type "button" and default variant class', () => {
    render(<Button variant='primary' size="md">Click me</Button>)
    const btn = screen.getByRole('button', { name: /click me/i })

    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('type', 'button') // default type
    // стили из mock
    expect(btn).toHaveClass('button', 'primary', 'md')
  })

  test('applies provided type, variant, size and extra className', () => {
    render(
      <Button type="submit" variant="secondary" size="lg" className="extra-class">
        Submit
      </Button>
    )
    const btn = screen.getByRole('button', { name: /submit/i })

    expect(btn).toHaveAttribute('type', 'submit')
    expect(btn).toHaveClass('button', 'secondary', 'lg', 'extra-class')
  })

  test('shows spinner when loading and becomes disabled', () => {
    const { container } = render(
      <Button variant="secondary" size="sm" loading>
        Sending
      </Button>
    )
    const btn = screen.getByRole('button', { name: /sending/i })

    expect(btn).toBeDisabled()
    // ищем элемент спиннера по mock классу
    const spinner = container.querySelector('.spinner')

    expect(spinner).toBeInTheDocument()
  })

  test('disabled prop prevents click handler', () => {
    const onClick = jest.fn()

    render(
      <Button variant="secondary" size="md" disabled onClick={onClick}>
        Disabled
      </Button>
    )
    const btn = screen.getByRole('button', { name: /disabled/i })

    expect(btn).toBeDisabled()
    fireEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  test('loading also prevents click handler', () => {
    const onClick = jest.fn()

    render(
      <Button variant="secondary" size="md" loading onClick={onClick}>
        Loading
      </Button>
    )
    const btn = screen.getByRole('button', { name: /loading/i })

    expect(btn).toBeDisabled()
    fireEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  test('passes through arbitrary props (aria-label, id, data-*)', () => {
    render(
      <Button variant="secondary" size="md" id="btn-id" aria-label="my-button" data-test="ok">
        Test
      </Button>
    )
    const btn = screen.getByLabelText('my-button')

    expect(btn).toHaveAttribute('id', 'btn-id')
    expect(btn).toHaveAttribute('data-test', 'ok')
  })

  test('variant "danger" and "tertiary" apply correct classes', () => {
    const { rerender } = render(
      <Button size="sm" variant="danger">
        Danger
      </Button>
    )

    expect(screen.getByRole('button', { name: /danger/i })).toHaveClass('danger')

    rerender(
      <Button size="sm" variant="tertiary">
        Tertiary
      </Button>
    )
    expect(screen.getByRole('button', { name: /tertiary/i })).toHaveClass('tertiary')
  })
})
