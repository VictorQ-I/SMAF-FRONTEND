import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Toast from './Toast'

describe('Toast Component', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not render when isVisible is false', () => {
    render(
      <Toast
        message="Test message"
        isVisible={false}
        onClose={mockOnClose}
      />
    )

    expect(screen.queryByText('Test message')).not.toBeInTheDocument()
  })

  it('renders when isVisible is true', () => {
    render(
      <Toast
        message="Test message"
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('applies correct styling for success type', () => {
    render(
      <Toast
        message="Success message"
        type="success"
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    const toastElement = screen.getByText('Success message').closest('div')
    expect(toastElement).toHaveClass('bg-green-500')
  })

  it('applies correct styling for error type', () => {
    render(
      <Toast
        message="Error message"
        type="error"
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    const toastElement = screen.getByText('Error message').closest('div')
    expect(toastElement).toHaveClass('bg-red-500')
  })

  it('applies correct styling for info type', () => {
    render(
      <Toast
        message="Info message"
        type="info"
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    const toastElement = screen.getByText('Info message').closest('div')
    expect(toastElement).toHaveClass('bg-blue-500')
  })

  it('defaults to success type when no type is provided', () => {
    render(
      <Toast
        message="Default message"
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    const toastElement = screen.getByText('Default message').closest('div')
    expect(toastElement).toHaveClass('bg-green-500')
  })

  it('calls onClose when close button is clicked', () => {
    render(
      <Toast
        message="Test message"
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('auto-closes after default duration (3000ms)', () => {
    render(
      <Toast
        message="Test message"
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    expect(mockOnClose).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('auto-closes after custom duration', () => {
    render(
      <Toast
        message="Test message"
        isVisible={true}
        onClose={mockOnClose}
        duration={5000}
      />
    )

    expect(mockOnClose).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(4999)
    })

    expect(mockOnClose).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('does not auto-close when duration is 0', () => {
    render(
      <Toast
        message="Test message"
        isVisible={true}
        onClose={mockOnClose}
        duration={0}
      />
    )

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('clears timer when component unmounts', () => {
    const { unmount } = render(
      <Toast
        message="Test message"
        isVisible={true}
        onClose={mockOnClose}
        duration={3000}
      />
    )

    unmount()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('resets timer when isVisible changes', () => {
    const { rerender } = render(
      <Toast
        message="Test message"
        isVisible={true}
        onClose={mockOnClose}
        duration={3000}
      />
    )

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    // Change isVisible to false and back to true
    rerender(
      <Toast
        message="Test message"
        isVisible={false}
        onClose={mockOnClose}
        duration={3000}
      />
    )

    rerender(
      <Toast
        message="Test message"
        isVisible={true}
        onClose={mockOnClose}
        duration={3000}
      />
    )

    // Should not close after the remaining 1500ms from before
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(mockOnClose).not.toHaveBeenCalled()

    // Should close after full 3000ms from the reset
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})