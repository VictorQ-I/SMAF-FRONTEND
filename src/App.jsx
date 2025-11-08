import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/layout'
import { Dashboard, AuthPage, TransactionsListPage, TransferFormPage, CreateClientPage } from './pages'
import RulesManagementPage from './pages/RulesManagementPage'
import RejectionStatsPage from './pages/RejectionStatsPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route
            path="/login"
            element={
              <Layout>
                <AuthPage />
              </Layout>
            }
          />
          <Route
            path="/"
            element={
              <Layout>
                <TransferFormPage />
              </Layout>
            }
          />
          <Route
            path="/transfer"
            element={
              <Layout>
                <TransferFormPage />
              </Layout>
            }
          />

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fraud-rules"
            element={
              <ProtectedRoute>
                <Layout>
                  <RulesManagementPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fraud-rules/rejections"
            element={
              <ProtectedRoute>
                <Layout>
                  <RejectionStatsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-client"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateClientPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Layout>
                  <TransactionsListPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
