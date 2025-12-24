import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Textarea } from './Textarea'

describe('Textarea component', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders textarea with default props', () => {
    render(<Textarea {...defaultProps} placeholder="Enter text" />)
    const textareaElement = screen.getByPlaceholderText('Enter text')

    expect(textareaElement).toBeInTheDocument()
    expect(textareaElement).toHaveAttribute('rows', '4')
    expect(textareaElement).not.toHaveAttribute('cols')
    expect(textareaElement).not.toBeDisabled()
  })

  it('applies custom className to textarea', () => {
    render(<Textarea {...defaultProps} className="custom-class" />)
    const textareaElement = screen.getByRole('textbox')

    expect(textareaElement).toHaveClass('custom-class')
  })

  it('renders disabled textarea', () => {
    render(<Textarea {...defaultProps} disabled />)
    const textareaElement = screen.getByRole('textbox')

    expect(textareaElement).toBeDisabled()
    expect(textareaElement).toHaveClass('disabled')
  })

  it('applies error class to textarea when error is true', () => {
    render(<Textarea {...defaultProps} error />)
    const textareaElement = screen.getByRole('textbox')

    expect(textareaElement).toHaveClass('error')
  })

  it('renders errorMessage when provided', () => {
    render(<Textarea {...defaultProps} errorMessage="Invalid input" />)
    const errorMessageElement = screen.getByText('Invalid input')

    expect(errorMessageElement).toBeInTheDocument()
  })

  it('does not render errorMessage when not provided', () => {
    render(<Textarea {...defaultProps} />)
    const errorMessageElement = screen.queryByText('Invalid input')

    expect(errorMessageElement).not.toBeInTheDocument()
  })

  it('handles onChange event', async () => {
    const handleChange = jest.fn()

    render(<Textarea {...defaultProps} onChange={handleChange} />)
    const textareaElement = screen.getByRole('textbox')

    await userEvent.type(textareaElement, 'test input')
    expect(handleChange).toHaveBeenCalled()
  })

  it('sets custom rows and cols', () => {
    render(<Textarea {...defaultProps} rows={6} cols={40} />)
    const textareaElement = screen.getByRole('textbox')

    expect(textareaElement).toHaveAttribute('rows', '6')
    expect(textareaElement).toHaveAttribute('cols', '40')
  })

  it('applies additional textarea attributes', () => {
    render(<Textarea {...defaultProps} maxLength={100} aria-label="Test textarea" />)
    const textareaElement = screen.getByLabelText('Test textarea')

    expect(textareaElement).toHaveAttribute('maxlength', '100')
  })
})