import api from './api'

// Preview auth is the default until a backend is ready. Set VITE_AUTH_MODE=api
// to use the same API contract expected by the production backend.
const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || 'preview'
export const isPreviewAuth = AUTH_MODE !== 'api'
const USERS_KEY = 'campusecom.previewUsers.v1'
const SESSION_KEY = 'campusecom.previewSession.v1'

function readUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    return Array.isArray(users) ? users : []
  } catch {
    return []
  }
}

function userFromRegistration(data) {
  const now = Date.now()
  return {
    id: `preview-${now}`,
    email: data.email.trim().toLowerCase(),
    first_name: data.first_name.trim(),
    last_name: data.last_name.trim(),
    full_name: `${data.first_name.trim()} ${data.last_name.trim()}`,
    phone: data.phone || '',
    role: data.role || 'buyer',
    is_preview: true,
  }
}

export const login = async (email, password) => {
  if (AUTH_MODE === 'api') {
    const response = await api.post('/users/login/', { email, password })
    return response.data
  }

  const normalizedEmail = email.trim().toLowerCase()
  const registeredUser = readUsers().find((user) => user.email === normalizedEmail)
  const fallbackName = normalizedEmail.split('@')[0].replace(/[._-]+/g, ' ')
  const user = registeredUser || {
    id: `preview-${normalizedEmail}`,
    email: normalizedEmail,
    first_name: fallbackName,
    last_name: '',
    full_name: fallbackName,
    role: normalizedEmail === 'seller@campusecom.zm' ? 'seller' : 'buyer',
    is_preview: true,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return {
    success: true,
    tokens: { access: `preview-${user.id}`, refresh: `preview-refresh-${user.id}` },
    user,
  }
}

export const register = async (userData) => {
  if (AUTH_MODE === 'api') {
    const response = await api.post('/users/register/', userData)
    return response.data
  }

  const user = userFromRegistration(userData)
  const users = readUsers()
  if (users.some((existing) => existing.email === user.email)) {
    throw new Error('An account with this email already exists. Sign in instead.')
  }
  localStorage.setItem(USERS_KEY, JSON.stringify([user, ...users]))
  return { success: true, message: 'Preview account created. Sign in to continue.', user }
}

export const getCurrentUser = async () => {
  if (AUTH_MODE === 'api') {
    const response = await api.get('/users/me/')
    return response.data
  }

  const user = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  if (!user) throw new Error('Preview session has expired')
  return { user }
}

export const clearPreviewSession = () => {
  if (AUTH_MODE === 'preview') localStorage.removeItem(SESSION_KEY)
}

export const updateProfile = async (data) => {
  if (AUTH_MODE !== 'api') {
    const currentUser = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    if (!currentUser) throw new Error('Preview session has expired')
    const updatedUser = {
      ...currentUser,
      ...data,
      first_name: data.first_name?.trim() ?? currentUser.first_name,
      last_name: data.last_name?.trim() ?? currentUser.last_name,
    }
    updatedUser.full_name = `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim()
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser))
    const users = readUsers()
    const userExists = users.some((user) => user.email === updatedUser.email)
    const nextUsers = userExists
      ? users.map((user) => user.email === updatedUser.email ? updatedUser : user)
      : [updatedUser, ...users]
    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers))
    return { user: updatedUser }
  }
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
