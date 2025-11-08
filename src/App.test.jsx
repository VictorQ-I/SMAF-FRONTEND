import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'
import { useAuth } from './contexts/AuthContext'

// Mock all the page components
vi.mock('./pages', () => ({
  Dashboard: () => <div data-testid="dashboard-page">Dashboard Page</div>,
  AuthPage: () => <div data-testid="auth-page">Auth Page</div>,
  TransactionsListPage: () => <div data-testid="transactions-page">Transactions Page</div>,
  TransferFormPage: () => <div data-testid="transfer-page">Transfer Page</div>,
  CreateClientPage: () => <div data-testid="create-client-page">Create Client Page</div>
}))

vi.mock('./pages/RulesManagementPage', () => ({
  default: () => <div data-testid="rules-page">Rules Management Page</div>
}))

vi.mock('./pages/RejectionStatsPage', () => ({
  default: () => <div data-testid="rejection-stats-page">Rejection Stats Page</div>
}))

// Mock the layout component
vi.mock('./components/layout', () => ({
  Layout: ({ children }) => <div data-testid="layout">{children}</div>
}))

// Mock ProtectedRoute
vi.mock('./components/ProtectedRoute', () => ({
  default: ({ children }) => <div data-testid="protected-route">{children}</div>
}))

// Mock AuthContext
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: vi.fn()
}))

// Mock react-router-dom for testing routes
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
    Routes: ({ children }) => <div data-testid="routes">{children}</div>,
    Route: ({ element }) => <div data-testid="route">{element}</div>,
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>,
    useNavigate: () => mockNavigate
  }
})

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.getByTestId('browser-router')).toBeInTheDocument()
    expect(screen.getByTestId('routes')).toBeInTheDocument()
  })

  it('wraps application with AuthProvider and BrowserRouter', () => {
    render(<App />)
    
    // Check that the app is wrapped with the necessary providers
    const authProvider = screen.getByTestId('auth-provider')
    const browserRouter = screen.getByTestId('browser-router')
    
    expect(authProvider).toBeInTheDocument()
    expect(browserRouter).toBeInTheDocument()
    
    // BrowserRouter should be inside AuthProvider
    expect(authProvider).toContainElement(browserRouter)
  })

  it('contains routes structure', () => {
    render(<App />)
    
    expect(screen.getByTestId('routes')).toBeInTheDocument()
    expect(screen.getAllByTestId('route')).toHaveLength(9) // Total number of routes
  })

  it('includes all expected route components', () => {
    render(<App />)
    
    // Check that all page components are rendered (they're all rendered in the Route elements)
    expect(screen.getByTestId('auth-page')).toBeInTheDocument()
    expect(screen.getAllByTestId('transfer-page')).toHaveLength(2) // Two transfer routes
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    expect(screen.getByTestId('rules-page')).toBeInTheDocument()
    expect(screen.getByTestId('rejection-stats-page')).toBeInTheDocument()
    expect(screen.getByTestId('create-client-page')).toBeInTheDocument()
    expect(screen.getByTestId('transactions-page')).toBeInTheDocument()
  })

  it('wraps protected routes with ProtectedRoute component', () => {
    render(<App />)
    
    // All protected routes should be wrapped with ProtectedRoute
    const protectedRoutes = screen.getAllByTestId('protected-route')
    expect(protectedRoutes.length).toBeGreaterThan(0)
    
    // Check that protected components are inside ProtectedRoute
    const dashboardInProtected = protectedRoutes.some(route => 
      route.querySelector('[data-testid="dashboard-page"]')
    )
    expect(dashboardInProtected).toBe(true)
  })

  it('wraps all routes with Layout component', () => {
    render(<App />)
    
    // All routes should be wrapped with Layout
    const layouts = screen.getAllByTestId('layout')
    expect(layouts.length).toBeGreaterThan(0)
    
    // Check that page components are inside Layout
    const transferInLayout = layouts.some(layout => 
      layout.querySelector('[data-testid="transfer-page"]')
    )
    expect(transferInLayout).toBe(true)
  })

  it('includes Navigate component for catch-all route', () => {
    render(<App />)
    
    const navigateElement = screen.getByTestId('navigate')
    expect(navigateElement).toBeInTheDocument()
    expect(navigateElement).toHaveAttribute('data-to', '/')
  })
})