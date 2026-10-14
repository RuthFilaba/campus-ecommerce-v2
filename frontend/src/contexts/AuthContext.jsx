import React, { createContext, useState, useContext, useEffect } from 'react'
import { login as loginAPI, register as registerAPI, getCurrentUser, clearPreviewSession } from '../services/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser()
      const currentUser = userData.user || userData
      setUser(currentUser)
      return currentUser
    } catch (error) {
      console.error('Failed to load user:', error)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      return null
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const data = await loginAPI(email, password)
      
      // Handle your backend response format
      if (data.success && data.tokens) {
        localStorage.setItem('access_token', data.tokens.access)
        localStorage.setItem('refresh_token', data.tokens.refresh)
        const currentUser = await loadUser()
        toast.success(`Welcome back, ${data.user?.full_name || email}!`)
        return currentUser || true
      } else if (data.access && data.refresh) {
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        const currentUser = await loadUser()
        toast.success('Welcome back!')
        return currentUser || true
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Login error:', error.response?.data)
      const message = error.response?.data?.message || 
                     error.response?.data?.detail || 
                     error.response?.data?.error ||
                     error.message || 'Login failed. Please check your credentials.'
      toast.error(message)
      return false
    }
  }

  const register = async (userData) => {
    try {
      // Remove confirm_password before sending to API
      const { confirm_password, ...dataToSend } = userData
      const response = await registerAPI(dataToSend)
      
      // Handle your backend response format
      if (response.success) {
        toast.success(response.message || 'Registration successful! Please login.')
        return true
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data)
      const message = error.response?.data?.message || 
                     error.response?.data?.detail || 
                     error.response?.data?.error ||
                     error.message || 'Registration failed. Please try again.'
      toast.error(message)
      return false
    }
  }

  const logout = () => {
    clearPreviewSession()
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isBuyer: user?.role === 'buyer',
    isSeller: user?.role === 'seller',
    isAdmin: user?.role === 'admin',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
