export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const ROUTES = {
  DASHBOARD: '/',
  REPORTS: '/reports',
  SETTINGS: '/settings'
}

export const FRAUD_STATUS = {
  SAFE: 'safe',
  WARNING: 'warning',
  FRAUD: 'fraud'
}