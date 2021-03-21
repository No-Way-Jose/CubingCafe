import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {
      loggedIn: false,
      displayName: 'Login'
    },
    authError: {
      error: false,
      message: ''
    },
    data: {
      loaded: false
    }
  },

  mutations: {
    setUserState: (state, user) => {
      if (user) {
        state.user.loggedIn = true
        state.user.displayName = user.email.substring(0, user.email.indexOf('@'))
      } else {
        state.user.loggedIn = false
        state.user.displayName = 'Login'
      }
    },
    resetAuthError: (state) => {
      state.authError.error = false
      state.authError.message = ''
    }
  },

  actions: {
    // On auth state change we update the users status in the store
    fetchUser ({ commit }, user) {
      if (user) {
        commit('setUserState', user)
      } else {
        commit('setUserState', false)
      }
    }
  }
})
