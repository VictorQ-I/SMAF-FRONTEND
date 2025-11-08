import { createContext, useContext, useReducer, useEffect } from 'react'
import { apiService } from '../services/api'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null
      }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    default:
      return state
  }
}

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const initAuth = async () => {
      const token = apiService.getAuthToken()
      if (token) {
        try {
          const response = await apiService.getCurrentUser()
          if (response.success) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user: response.data,
                token
              }
            })
          } else {
            apiService.removeAuthToken()
            dispatch({ type: 'LOGOUT' })
          }
        } catch (error) {
          apiService.removeAuthToken()
          dispatch({ type: 'LOGOUT' })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await apiService.login(email, password)
      if (response.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data,
            token: response.token
          }
        })
        return { success: true }
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: response.error || 'Error en el login'
        })
        return { success: false, error: response.error }
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message
      })
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await apiService.register(userData)
      if (response.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data,
            token: response.token
          }
        })
        return { success: true }
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: response.error || 'Error en el registro'
        })
        return { success: false, error: response.error }
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message
      })
      return { success: false, error: error.message }
    }
  }

  const createClient = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await apiService.register(userData)
      dispatch({ type: 'SET_LOADING', payload: false })
      
      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.error || 'Error al crear el cliente' }
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    apiService.logout()
    dispatch({ type: 'LOGOUT' })
  }

  const value = {
    ...state,
    login,
    register,
    createClient,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}