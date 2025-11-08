import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Header = () => {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const location = useLocation()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold text-gray-900 hover:text-blue-600">
              SMAF
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-4">
              <Link 
                to="/transfer" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/transfer' || location.pathname === '/'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Nueva Transacción
              </Link>
              
              {user && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/dashboard'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/transactions" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/transactions'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Transacciones
                  </Link>
                  {user.role === 'admin' && (
                    <>
                      <Link 
                        to="/fraud-rules" 
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          location.pathname === '/fraud-rules'
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Reglas Antifraude
                      </Link>
                      <Link 
                        to="/create-client" 
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          location.pathname === '/create-client'
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        Crear Cliente
                      </Link>
                    </>
                  )}
                  {['admin', 'analyst'].includes(user.role) && (
                    <Link 
                      to="/fraud-rules/rejections" 
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === '/fraud-rules/rejections'
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Rechazos por Regla
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* User Menu or Login Button */}
            {user ? (
              <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block">{user?.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Rol: {user.role === 'admin' ? 'Administrador' : 
                              user.role === 'analyst' ? 'Analista' : 'Viewer'}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Iniciar Sesión
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header