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
      timer: { sessionID: '', history: [], best: 0, avg5: 0, avg12: 0 }
    }
  },

  mutations: {
    setUserState: (state, user) => {
      if (user) {
        state.user.loggedIn = true
        state.user.displayName = user
      } else {
        state.user.loggedIn = false
        state.user.displayName = 'Login'
      }
    },
    saveTimerData: (state, data) => {
      state.data.timer = data
    },
    resetAuthError: (state) => {
      state.authError.error = false
      state.authError.message = ''
    }
  }
})
