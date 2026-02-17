import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import auth from './modules/auth'
import mindmap from './modules/mindmap'
import team from './modules/team'

Vue.use(Vuex)

const store = new Vuex.Store({
  // app module is NOT namespaced — its state/mutations are at root level
  ...app,
  modules: {
    auth,
    mindmap,
    team
  }
})

export default store
