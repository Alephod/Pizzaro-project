import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Input } from './Input'

describe('Input component', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders basic input with default props', () => {
    render(<Input {...defaultProps} placeholder="Enter text" />)
    const inputElement = screen.getByPlaceholderText('Enter text')

    expect(inputElement).toBeInTheDocument()
    expect(inputElement).toHaveAttribute('type', 'text')
    expect(inputElement).not.toBeDisabled()
  })

  it('renders input with custom className', () => {
    render(<Input {...defaultProps} className="custom-class" />)
    const wrapperElement = screen.getByRole('textbox').parentElement?.parentElement

    expect(wrapperElement).toHaveClass('custom-class')
  })

  it('renders disabled input', () => {
    render(<Input {...defaultProps} disabled />)
    const inputElement = screen.getByRole('textbox')

    expect(inputElement).toBeDisabled()
    expect(inputElement).toHaveClass('disabled')
  })

  it('renders input with error and errorMessage', () => {
    render(<Input {...defaultProps} error errorMessage="Invalid input" />)
    const inputElement = screen.getByRole('textbox')

    expect(inputElement).toHaveClass('error')
    const errorMessageElement = screen.getByText('Invalid input')

    expect(errorMessageElement).toBeInTheDocument()
  })

  it('does not render errorMessage when error is false', () => {
    render(<Input {...defaultProps} error={false} errorMessage="Invalid input" />)
    const errorMessageElement = screen.queryByText('Invalid input')

    expect(errorMessageElement).not.toBeInTheDocument()
  })

  it('handles onChange event', async () => {
    const handleChange = jest.fn()

    render(<Input {...defaultProps} onChange={handleChange} />)
    const inputElement = screen.getByRole('textbox')

    await userEvent.type(inputElement, 'test')
    expect(handleChange).toHaveBeenCalled()
  })

  it('renders rightAdornment', () => {
    render(<Input {...defaultProps} rightAdornment={<span>@example.com</span>} />)
    const adornmentElement = screen.getByText('@example.com')

    expect(adornmentElement).toBeInTheDocument()
  })

  it('renders password input with toggle button', () => {
    render(<Input {...defaultProps} type="password" />)

    const toggleButton = screen.getByRole('button')

    expect(toggleButton).toBeInTheDocument()
    const eyeIcon = toggleButton.querySelector('svg')

    expect(eyeIcon).toBeInTheDocument()
  })

  it('toggles password visibility on button click', async () => {
    const user = userEvent.setup()

    render(<Input {...defaultProps} type="password" value="secret" />)
    const inputElement = screen.getByDisplayValue('secret')

    expect(inputElement).toHaveAttribute('type', 'password')

    const toggleButton = screen.getByRole('button')

    await user.click(toggleButton)
    expect(inputElement).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(inputElement).toHaveAttribute('type', 'password')
  })

  it('forwards ref to the input element', () => {
    const ref = React.createRef<HTMLInputElement>()

    render(<Input {...defaultProps} ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('applies additional input attributes', () => {
    render(<Input {...defaultProps} maxLength={10} aria-label="Test input" />)
    const inputElement = screen.getByLabelText('Test input')

    expect(inputElement).toHaveAttribute('maxlength', '10')
  })
})