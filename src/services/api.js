import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

let getAccessTokenSilently = null

export const setAuthTokenGetter = (getter) => {
  getAccessTokenSilently = getter
}

api.interceptors.request.use(async (config) => {
  if (getAccessTokenSilently) {
    try {
      const token = await getAccessTokenSilently()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Failed to get access token:', error)
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized request')
    }
    return Promise.reject(error)
  }
)

export const agentsApi = {
  list: () => api.get('/api/agents'),
  get: (slug) => api.get(`/api/agents/${slug}`),
}

export const tiersApi = {
  list: () => api.get('/api/tiers'),
}

export const boxesApi = {
  list: () => api.get('/api/boxes'),
  get: (id) => api.get(`/api/boxes/${id}`),
  create: (data) => api.post('/api/boxes', data),
  update: (id, data) => api.put(`/api/boxes/${id}`, data),
  delete: (id) => api.delete(`/api/boxes/${id}`),
  syncSsh: (id) => api.post(`/api/boxes/${id}/sync-ssh`),
}

export const boxAgentsApi = {
  list: (boxId) => api.get(`/api/boxes/${boxId}/agents`),
  get: (boxId, agentId) => api.get(`/api/boxes/${boxId}/agents/${agentId}`),
  install: (boxId, data) => api.post(`/api/boxes/${boxId}/agents`, data),
  update: (boxId, agentId, data) => api.put(`/api/boxes/${boxId}/agents/${agentId}`, data),
  delete: (boxId, agentId) => api.delete(`/api/boxes/${boxId}/agents/${agentId}`),
  getLog: (boxId, agentId) => api.get(`/api/boxes/${boxId}/agents/${agentId}/log`),
}

export const billingApi = {
  createCheckoutSession: (data) => api.post('/api/billing/checkout-session', data),
  createPortalSession: () => api.post('/api/billing/customer-portal'),
}

export const usersApi = {
  me: () => api.get('/api/users/me'),
  update: (data) => api.put('/api/users/me', data),
}

export default api
