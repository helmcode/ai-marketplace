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

export const deploymentsApi = {
  list: () => api.get('/api/deployments'),
  get: (id) => api.get(`/api/deployments/${id}`),
  create: (data) => api.post('/api/deployments', data),
  delete: (id) => api.delete(`/api/deployments/${id}`),
}

export const usersApi = {
  me: () => api.get('/api/users/me'),
  update: (data) => api.put('/api/users/me', data),
}

export default api
