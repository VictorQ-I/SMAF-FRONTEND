import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Dashboard from './Dashboard'
import { useAuth } from '../contexts/AuthContext'

// Mock del hook useAuth
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

// Mock de los hooks de transacciones
vi.mock('../hooks/useTransactions', () => ({
  useTransactionStats: vi.fn(() => ({
    stats: {
      total: 100,
      approved: 80,
      rejected: 15,
      pending: 5,
      lowRisk: 70,
      mediumRisk: 25,
      highRisk: 5,
      pendingHighRisk: 2
    },
    loading: false,
    error: null
  }))
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { name: 'Test User', role: 'admin' },
      isAuthenticated: true
    })
  })

  it('renders dashboard title', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByText('Dashboard Anti-Fraude')).toBeInTheDocument()
  })

  it('renders statistics cards', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByText('Transacciones Seguras')).toBeInTheDocument()
    expect(screen.getByText('Alertas Pendientes')).toBeInTheDocument()
    expect(screen.getByText('Fraudes Detectados')).toBeInTheDocument()
  })

  it('renders view reports button', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByRole('button', { name: /ver reportes/i })).toBeInTheDocument()
  })
})