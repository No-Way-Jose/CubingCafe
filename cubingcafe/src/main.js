import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import store from '../store/store.js'
import scroll from 'vue-scrollto'
import { directive } from 'v-aspect-ratio'
import { required, email, min } from 'vee-validate/dist/rules'
import { extend, ValidationObserver, ValidationProvider, setInteractionMode } from 'vee-validate'
import vSelect from 'vue-select'
import VueGoogleCharts from 'vue-google-charts'

Vue.config.productionTip = false


Vue.use(scroll)
Vue.use(VueGoogleCharts)
Vue.directive('aspect-ratio', directive)


setInteractionMode('eager')
extend('required', { ...required, message: '{_field_} cannot be empty' })
extend('min', { ...min, message: '{_field_} may not be less than {length} characters' })
extend('email', { ...email, message: 'Email must be valid' })

Vue.component('v-select', vSelect)
Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)

new Vue({
  router,
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')
