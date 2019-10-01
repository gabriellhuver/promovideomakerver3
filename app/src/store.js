import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    status: false
  },
  mutations: {
    status(state, status){
      state.status = status
    }
  },
  actions: {

  }
})
