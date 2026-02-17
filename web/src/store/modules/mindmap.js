import { getMindMaps, deleteMindMap as deleteApi } from '@/api/mindmaps'
import { getTeamMindMaps } from '@/api/teams'

const mindmap = {
  namespaced: true,
  state: {
    list: [],
    loading: false
  },
  mutations: {
    SET_LIST(state, list) {
      state.list = list
    },
    SET_LOADING(state, val) {
      state.loading = val
    },
    REMOVE_ITEM(state, id) {
      state.list = state.list.filter(item => item.id !== id)
    }
  },
  actions: {
    async fetchList({ commit }, teamId) {
      commit('SET_LOADING', true)
      try {
        const { data } = teamId
          ? await getTeamMindMaps(teamId)
          : await getMindMaps()
        commit('SET_LIST', data)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deleteItem({ commit }, id) {
      await deleteApi(id)
      commit('REMOVE_ITEM', id)
    }
  }
}

export default mindmap
