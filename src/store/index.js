import Vue from "vue"
import Vuex from "vuex"
import auth from "./auth"
import info from "./info"
import category from "./category"
import record from "./record"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    error: null
  },
  mutations: {
    setError(state, error) {
      state.error = error
    },
    clearError(state) {
      state.error = null
    }
  },
  getters: {
    error: s => s.error
  },
  actions: {
    async fetchCurrency() {
      const res = await fetch(
        `https://api.exchangeratesapi.io/latest?symbols=USD,RUB`
      )
      return await res.json()
    }
  },
  modules: {
    auth,
    info,
    category,
    record
  }
})
