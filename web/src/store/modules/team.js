import { getTeams, getTeam, deleteTeam as deleteApi } from '@/api/teams'
import { getInvitations } from '@/api/teams'

const team = {
  namespaced: true,
  state: {
    list: [],
    currentTeam: null,
    invitations: [],
    loading: false
  },
  mutations: {
    SET_LIST(state, list) {
      state.list = list
    },
    SET_CURRENT(state, team) {
      state.currentTeam = team
    },
    SET_INVITATIONS(state, list) {
      state.invitations = list
    },
    SET_LOADING(state, val) {
      state.loading = val
    }
  },
  actions: {
    async fetchTeams({ commit }) {
      commit('SET_LOADING', true)
      try {
        const { data } = await getTeams()
        commit('SET_LIST', data)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchTeamDetail({ commit }, id) {
      const { data } = await getTeam(id)
      commit('SET_CURRENT', data)
      return data
    },
    async deleteTeam({ dispatch }, id) {
      await deleteApi(id)
      dispatch('fetchTeams')
    },
    async fetchInvitations({ commit }) {
      const { data } = await getInvitations()
      commit('SET_INVITATIONS', data)
    }
  }
}

export default team
