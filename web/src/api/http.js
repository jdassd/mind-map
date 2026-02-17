import axios from 'axios'
import store from '@/store'
import router from '@/router'

const http = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

/**
 * 从 API 错误响应中提取用户友好的错误信息
 * 处理 FastAPI 返回的各种 detail 格式（字符串、数组、对象）
 */
function extractErrorMessage(error) {
  if (!error.response || !error.response.data) return ''
  const detail = error.response.data.detail
  if (!detail) return ''
  // detail 是字符串，直接返回
  if (typeof detail === 'string') return detail
  // detail 是数组（Pydantic 验证错误格式）
  if (Array.isArray(detail)) {
    return detail
      .map(err => {
        const field = err.loc ? err.loc[err.loc.length - 1] : ''
        return field ? `${field}: ${err.msg}` : err.msg
      })
      .join('；')
  }
  // detail 是对象
  if (typeof detail === 'object' && detail.msg) return detail.msg
  return JSON.stringify(detail)
}

// 将提取的消息挂载到 error 对象上，方便组件使用
function normalizeError(error) {
  if (error.response && error.response.data) {
    error._friendlyMessage = extractErrorMessage(error)
  }
  return error
}

// Request interceptor: attach JWT
http.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 + auto refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

http.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return http(originalRequest)
        })
      }
      originalRequest._retry = true
      isRefreshing = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        isRefreshing = false
        store.dispatch('auth/logout')
        router.push('/login')
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post('/api/auth/refresh', {
          refresh_token: refreshToken
        })
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        processQueue(null, data.access_token)
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`
        return http(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        store.dispatch('auth/logout')
        router.push('/login')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

// 错误信息标准化拦截器：确保所有错误都有友好的消息
http.interceptors.response.use(
  response => response,
  error => {
    normalizeError(error)
    return Promise.reject(error)
  }
)

export default http
