import { render, screen, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import { apiService } from '../services/api'

// Mock del apiService
vi.mock('../services/api', () => ({
  apiService: {
    getAuthToken: vi.fn(),
    getCurrentUser: vi.fn(),
    removeAuthToken: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn()
  }
}))

// Componente de prueba para usar el hook
const TestComponent = () => {
  const auth = useAuth()
  return (
    <div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="user">{auth.user ? auth.user.email : 'null'}</div>
      <div data-testid="error">{auth.error || 'null'}</div>
      <button onClick={() => auth.login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={() => auth.register({ email: 'test@example.com', password: 'password' })}>
        Register
      </button>
      <button onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })

  it('initializes with correct default state', async () => {
    apiService.getAuthToken.mockReturnValue(null)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('user')).toHaveTextContent('null')
    expect(screen.getByTestId('error')).toHaveTextContent('null')
  })

  it('initializes with existing token and valid user', async () => {
    const mockUser = { email: 'test@example.com', id: 1 }
    apiService.getAuthToken.mockReturnValue('valid-token')
    apiService.getCurrentUser.mockResolvedValue({
      success: true,
      data: mockUser
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('removes invalid token on initialization', async () => {
    apiService.getAuthToken.mockReturnValue('invalid-token')
    apiService.getCurrentUser.mockResolvedValue({
      success: false
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(apiService.removeAuthToken).toHaveBeenCalled()
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('handles successful login', async () => {
    const mockUser = { email: 'test@example.com', id: 1 }
    apiService.getAuthToken.mockReturnValue(null)
    apiService.login.mockResolvedValue({
      success: true,
      data: mockUser,
      token: 'new-token'
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    await act(async () => {
      screen.getByText('Login').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    expect(apiService.login).toHaveBeenCalledWith('test@example.com', 'password')
  })

  it('handles failed login', async () => {
    apiService.getAuthToken.mockReturnValue(null)
    apiService.login.mockResolvedValue({
      success: false,
      error: 'Credenciales inválidas'
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    await act(async () => {
      screen.getByText('Login').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Credenciales inválidas')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
  })

  it('handles successful registration', async () => {
    const mockUser = { email: 'test@example.com', id: 1 }
    apiService.getAuthToken.mockReturnValue(null)
    apiService.register.mockResolvedValue({
      success: true,
      data: mockUser,
      token: 'new-token'
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    await act(async () => {
      screen.getByText('Register').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
  })

  it('handles logout', async () => {
    const mockUser = { email: 'test@example.com', id: 1 }
    apiService.getAuthToken.mockReturnValue('valid-token')
    apiService.getCurrentUser.mockResolvedValue({
      success: true,
      data: mockUser
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    await act(async () => {
      screen.getByText('Logout').click()
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('user')).toHaveTextContent('null')
    expect(apiService.logout).toHaveBeenCalled()
  })
})