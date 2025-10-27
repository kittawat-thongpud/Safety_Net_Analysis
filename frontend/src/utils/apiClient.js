import axios from 'axios'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: '/api', // Proxy through Vite dev server
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data)

      if (error.response.status === 401) {
        // Handle unauthorized
        localStorage.removeItem('authToken')
        window.location.href = '/login'
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request)
    } else {
      // Something else happened
      console.error('Error:', error.message)
    }

    return Promise.reject(error)
  }
)

// API methods
export const apiMethods = {
  // Configuration
  getPresets: () => apiClient.get('/config/presets'),
  getMaterials: () => apiClient.get('/config/materials'),
  loadPreset: (presetName) => apiClient.get(`/config/load/${presetName}`),
  saveConfig: (config) => apiClient.post('/config/save', config),
  loadConfig: (filepath) => apiClient.post('/config/load', { filepath }),
  listConfigs: () => apiClient.get('/config/list'),

  // Analysis
  runAnalysis: (config) => apiClient.post('/analyze', config),
  generatePlots: (config) => apiClient.post('/plots', config),
  generateReport: (config) => apiClient.post('/report', config, {
    responseType: 'blob'
  }),

  // Health check
  healthCheck: () => apiClient.get('/health'),
}

export { apiClient }