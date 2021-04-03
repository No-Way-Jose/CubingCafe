import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import store from '../store/store.js'
import scroll from 'vue-scrollto'
import { directive } from 'v-aspect-ratio'
import firebase from 'firebase/app'
import 'firebase/auth'
import { required, email, min } from 'vee-validate/dist/rules'
import { extend, ValidationObserver, ValidationProvider, setInteractionMode } from 'vee-validate'
import vSelect from 'vue-select'
import VueGoogleCharts from 'vue-google-charts'
import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'

Vue.config.productionTip = false

const apolloClient = new ApolloClient({
  // You should use an absolute URL here
  uri: 'https://localhost:8080/graphql'
})

Vue.use(scroll)
Vue.use(VueApollo)
Vue.use(VueGoogleCharts)
Vue.directive('aspect-ratio', directive)

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

setInteractionMode('eager')
extend('required', { ...required, message: '{_field_} cannot be empty' })
extend('min', { ...min, message: '{_field_} may not be less than {length} characters' })
extend('email', { ...email, message: 'Email must be valid' })

Vue.component('v-select', vSelect)
Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)

const firebaseConfig = {
  apiKey: 'AIzaSyCHIHWHLYmcKZb_lGdAx3dtqVK0g5oDPI0',
  authDomain: 'cubingcafe.firebaseapp.com',
  projectId: 'cubingcafe',
  storageBucket: 'cubingcafe.appspot.com',
  messagingSenderId: '369352851940',
  appId: '1:369352851940:web:442413652bb4e3797d07f1',
  measurementId: 'G-DLE747K2E5'
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)
const auth = firebase.auth()
const googleAuth = new firebase.auth.GoogleAuthProvider()

auth.onAuthStateChanged(user => {
  store.dispatch('fetchUser', user)
})

export { auth, googleAuth }

new Vue({
  router,
  vuetify,
  store,
  apolloProvider,
  render: h => h(App)
}).$mount('#app')
