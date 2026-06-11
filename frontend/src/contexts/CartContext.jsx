import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 })
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, token } = useAuth()

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], total: 0, count: 0 })
      return
    }
    
    setLoading(true)
    try {
      const response = await api.get('/cart/')
      console.log('Cart loaded:', response.data)
      setCart(response.data)
    } catch (error) {
      console.error('Failed to load cart:', error.response?.data || error.message)
      setCart({ items: [], total: 0, count: 0 })
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadCart()
  }, [loadCart, isAuthenticated, token])

  const refreshCart = () => {
    loadCart()
  }

  const value = {
    cart,
    loading,
    refreshCart,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
