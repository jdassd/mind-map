import http from './http'

export function register(data) {
  return http.post('/auth/register', data)
}

export function login(data) {
  return http.post('/auth/login', data)
}

export function refreshToken(refresh_token) {
  return http.post('/auth/refresh', { refresh_token })
}

export function getMe() {
  return http.get('/auth/me')
}
