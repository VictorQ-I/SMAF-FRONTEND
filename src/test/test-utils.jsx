import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'

// Custom render function that includes providers
export const renderWithProviders = (ui, options = {}) => {
  const { initialEntries = ['/'], ...renderOptions } = options

  const Wrapper = ({ children }) => (
    <AuthProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </AuthProvider>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock user data for tests
export const mockUsers = {
  admin: {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  },
  analyst: {
    id: 2,
    name: 'Analyst User',
    email: 'analyst@example.com',
    role: 'analyst'
  },
  viewer: {
    id: 3,
    name: 'Viewer User',
    email: 'viewer@example.com',
    role: 'viewer'
  }
}

// Mock transaction data for tests
export const mockTransactions = [
  {
    id: 1,
    amount: 1000,
    recipient: 'John Doe',
    status: 'approved',
    riskLevel: 'low',
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 2,
    amount: 5000,
    recipient: 'Jane Smith',
    status: 'pending',
    riskLevel: 'high',
    createdAt: '2024-01-02T11:00:00Z'
  },
  {
    id: 3,
    amount: 2500,
    recipient: 'Bob Johnson',
    status: 'rejected',
    riskLevel: 'medium',
    createdAt: '2024-01-03T12:00:00Z'
  }
]

// Mock API responses
export const mockApiResponses = {
  login: {
    success: true,
    token: 'mock-jwt-token',
    data: mockUsers.admin
  },
  transactions: {
    success: true,
    data: {
      transactions: mockTransactions,
      pagination: {
        page: 1,
        pages: 1,
        total: 3,
        limit: 25
      }
    }
  },
  transactionStats: {
    success: true,
    data: {
      total: 100,
      approved: 80,
      rejected: 15,
      pending: 5,
      lowRisk: 70,
      mediumRisk: 25,
      highRisk: 5,
      pendingHighRisk: 2
    }
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'