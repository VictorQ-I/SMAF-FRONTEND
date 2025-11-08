import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Header from './Header'
import { useAuth } from '../../contexts/AuthContext'

// Mock del hook useAuth
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

// Mock de useLocation
const mockLocation = { pathname: '/' }
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => mockLocation
  }
})

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Header Component', () => {
  const mockLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders SMAF logo/title', () => {
    useAuth.mockReturnValue({
      user: null,
      logout: mockLogout
    })

    renderWithRouter(<Header />)

    expect(screen.getByText('SMAF')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'SMAF' })).toHaveAttribute('href', '/')
  })

  it('shows login button when user is not authenticated', () => {
    useAuth.mockReturnValue({
      user: null,
      logout: mockLogout
    })

    renderWithRouter(<Header />)

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login')
  })

  it('shows navigation links when user is authenticated', () => {
    useAuth.mockReturnValue({
      user: { name: 'John Doe', email: 'john@example.com', role: 'viewer' },
      logout: mockLogout
    })

    renderWithRouter(<Header />)

    expect(screen.getByText('Nueva Transacción')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Transacciones')).toBeInTheDocument()
  })

  it('shows admin-only links for admin users', () => {
    useAuth.mockReturnValue({
      user: { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      logout: mockLogout
    })

    renderWithRouter(<Header />)

    expect(screen.getByText('Reglas Antifraude')).toBeInTheDocument()
    expect(screen.getByText('Crear Cliente')).toBeInTheDocument()
    expect(screen.getByText('Rechazos por Regla')).toBeInTheDocument()
  })

  it('shows analyst links for analyst users', () => {
    useAuth.mockReturnValue({
      user: { name: 'Analyst User', email: 'analyst@example.com', role: 'analyst' },
      logout: mockLogout
    })

    renderWithRouter(<Header />)

    expect(screen.getByText('Rechazos por Regla')).toBeInTheDocument()
    expect(screen.queryByText('Reglas Antifraude')).not.toBeInTheDocument()
    expect(screen.queryByText('Crear Cliente')).not.toBeInTheDocument()
  })

  it('does not show admin/analyst links for viewer users', () => {
    useAuth.mockReturnValue({
      user: { name: 'Viewer User', email: 'viewer@example.com', role: 'viewer' },
      logout: mockLogout
    })

    renderWithRouter(<Header />)

    expect(screen.queryByText('Reglas Antifraude')).not.toBeInTheDocument()
    expect(screen.queryByText('Crear Cliente')).not.toBeInTheDocument()
    expect(screen.queryByText('Rechazos por Regla')).not.toBeInTheDocument()
  })

  it('shows user menu when authenticated', () => {
    useAuth.mockReturnValue({
      user: { name: 'John Doe', email: 'john@example.com', role: 'viewer' },
      logout: mockLogout
    })

    renderWithRouter(<Header />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('J')).toBeInTheDocument() // Avatar initial
  })

  it('toggles user menu on click', () => {
    useAuth.mockReturnValue({
      user: { name: 'John Doe', email: 'john@example.com', role: 'viewer' },
      logout: mockLogout
    })

    renderWithRouter(<Header />)

    // Menu should not be visible initially
    expect(screen.queryByText('Mi Perfil')).not.toBeInTheDocument()

    // Click to open menu
    const userButton = screen.getByRole('button', { name: /john doe/i })
    fireEvent.click(userButton)

    // Menu should be visible
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument()
    expect(screen.getByText('Configuración')).toBeInTheDocument()
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('shows correct role in user menu', () => {
    useAuth.mockReturnValue({
      user: { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      logout: mockLogout
    })

    renderWithRouter(<Header />)

    const userButton = screen.getByRole('button', { name: /admin user/i })
    fireEvent.click(userButton)

    expect(screen.getByText('Rol: Administrador')).toBeInTheDocument()
  })

  it('calls logout when logout button is clicked', () => {
    useAuth.mockReturnValue({
      user: { name: 'John Doe', email: 'john@example.com', role: 'viewer' },
      logout: mockLogout
    })

    renderWithRouter(<Header />)

    // Open user menu
    const userButton = screen.getByRole('button', { name: /john doe/i })
    fireEvent.click(userButton)

    // Click logout
    const logoutButton = screen.getByText('Cerrar Sesión')
    fireEvent.click(logoutButton)

    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('highlights active navigation link', () => {
    mockLocation.pathname = '/dashboard'
    
    useAuth.mockReturnValue({
      user: { name: 'John Doe', email: 'john@example.com', role: 'viewer' },
      logout: mockLogout
    })

    renderWithRouter(<Header />)

    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toHaveClass('text-blue-600', 'bg-blue-50')
  })

  it('handles user without name gracefully', () => {
    useAuth.mockReturnValue({
      user: { email: 'user@example.com', role: 'viewer' },
      logout: mockLogout
    })

    renderWithRouter(<Header />)

    // Should not crash and should show some fallback
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})