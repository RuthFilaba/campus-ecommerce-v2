import api from './api'

export const isPreviewAuth = false

export const login = async (email, password) => {
  const response = await api.post('/users/login/', { email, password })
  return response.data
}

export const register = async (userData) => {
  const response = await api.post('/users/register/', userData)
  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get('/users/me/')
  return response.data
}

export const clearPreviewSession = () => {
  localStorage.removeItem('campusecom.previewSession.v1')
}

export const updateProfile = async (data) => {
  const response = await api.patch('/users/me/', data)
  return response.data
}

export const changePassword = async (oldPassword, newPassword) => {
  const response = await api.post('/users/change-password/', {
    old_password: oldPassword,
    new_password: newPassword,
  })
  return response.data
}
