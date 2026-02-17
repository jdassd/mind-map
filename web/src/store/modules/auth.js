import { login as loginApi, register as registerApi, getMe } from '@/api/auth'

const auth = {
  namespaced: true,
  state: {
    user: null,
    isLoggedIn: !!localStorage.getItem('access_token')
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
      state.isLoggedIn = !!user
    },
    CLEAR_AUTH(state) {
      state.user = null
      state.isLoggedIn = false
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const { data } = await loginApi(credentials)
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      commit('SET_USER', null) // will be fetched by fetchUser
      return data
    },
    async register(_, userData) {
      const { data } = await registerApi(userData)
      return data
    },
    async fetchUser({ commit }) {
      try {
        const { data } = await getMe()
        commit('SET_USER', data)
        return data
      } catch {
        commit('CLEAR_AUTH')
        return null
      }
    },
    logout({ commit }) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      commit('CLEAR_AUTH')
    }
  },
  getters: {
    isLoggedIn: state => state.isLoggedIn,
    currentUser: state => state.user
  }
}

export default auth
