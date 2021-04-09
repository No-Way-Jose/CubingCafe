<template>
  <v-container class="loginContainer">
    <div v-if="screen === 'Login'">
      <v-row justify="center" style="text-align: center">
        <h1>Login to Cubing Cafe</h1>
      </v-row>
      <v-row justify="center" class="pb-3">
        <p class="my-7">Login using your username and password</p>
      </v-row>
      <ValidationObserver ref="observer" v-slot="{ validate }">
        <form>
          <ValidationProvider v-slot="{ errors }" name="Username" rules="required">
            <v-text-field
              color="#1791e8" prepend-inner-icon="mdi-account" placeholder="Username" :error-messages="errors"
              v-model="userCredentials.username" required solo
            ></v-text-field>
          </ValidationProvider>
          <ValidationProvider v-slot="{ errors }" name="Password" rules="required|min:8">
            <v-text-field
              color="#1791e8" prepend-inner-icon="mdi-lock" placeholder="Password" :error-messages="errors"
              v-model="userCredentials.password" type="Password" required solo counter
            ></v-text-field>
          </ValidationProvider>
          <v-alert v-if="authError" type="error" text dense outlined border="left" class="mt-5" icon="mdi-alert-outline">
            {{ $store.state.authError.message }}
          </v-alert>
          <v-row justify="center"><v-btn class="mt-6 mr-4 methodBtn" color="#1791e8" @click="submit">Login</v-btn></v-row>
        </form>
        <a v-if="validate"></a>
      </ValidationObserver>
    </div>
    <div v-if="screen === 'SignUp'">
      <v-row justify="center" style="text-align: center">
        <h1>Join Cubing Cafe now</h1>
      </v-row>
      <v-row justify="center" class="pb-3">
        <p class="my-7">Sign up by creating a username and password</p>
      </v-row>
      <ValidationObserver ref="observer" v-slot="{ validate }">
        <form>
          <ValidationProvider v-slot="{ errors }" name="Username" rules="required|max:30">
            <v-text-field
              color="#1791e8" prepend-inner-icon="mdi-account" placeholder="Username" :error-messages="errors"
              v-model="userCredentials.username" required solo
            ></v-text-field>
          </ValidationProvider>
          <ValidationProvider v-slot="{ errors }" name="Password" rules="required|min:8">
            <v-text-field
              color="#1791e8" prepend-inner-icon="mdi-lock" placeholder="Password" :error-messages="errors"
              v-model="userCredentials.password" type="Password" required solo counter
            ></v-text-field>
          </ValidationProvider>
          <v-row v-if="authError" style="color: crimson" class="pt-5">{{ $store.state.authError.message }}</v-row>
          <v-row justify="center"><v-btn class="mt-6 mr-4 methodBtn" color="#1791e8" @click="submit">Sign Up</v-btn></v-row>
        </form>
        <a v-if="validate"></a>
      </ValidationObserver>
    </div>
    <div v-if="screen === 'SignUp'">
      <v-row justify="center">
        <v-divider class="my-7" style="max-width: 450px;"/>
      </v-row>
      <v-row justify="center"><p>Already a member?</p></v-row>
      <v-row justify="center"><v-btn class="methodBtn" color="#1791e8" text outlined @click="toggleScreen('Login')">Login</v-btn></v-row>
    </div>
    <div v-if="screen === 'Login'">
      <v-row justify="center">
        <v-divider class="my-7" style="max-width: 450px;"/>
      </v-row>
      <v-row justify="center"><p>Don't have an account?</p></v-row>
      <v-row justify="center"><v-btn class="methodBtn" color="#1791e8" text outlined @click="toggleScreen('SignUp')">Sign Up</v-btn></v-row>
    </div>

    <!-- Snackbar template -->
    <v-snackbar color="error" class="snackMessage" v-model="snackMessage.activate" :timeout="snackMessage.timeout"
                top right transition="slide-y-transition">{{ snackMessage.message }}
    </v-snackbar>

  </v-container>

</template>

<script>

export default {
  name: 'Login',
  data () {
    return {
      screen: 'Login',
      userCredentials: { username: '', password: '' },
      snackMessage: { activate: false, message: null, timeout: 5000 }
    }
  },
  computed: {
    authError () {
      return this.$store.state.authError.error
    }
  },
  methods: {
    submit () {
      this.$refs.observer.validate().then((value) => {
        if (value) {
          if (this.screen === 'Login') {
            this.authChange('login')
          } else {
            this.authChange('signup')
          }
        } else {
          this.showSnack('Invalid Input. Try again ...')
        }
      })
    },
    toggleScreen (screen) {
      this.screen = screen
      this.$store.commit('resetAuthError')
      this.userCredentials = { username: '', password: '' }
    },
    async authChange(method) {
      let queryObj = {}
      let changeType = ''
      if (method === 'login') {
        queryObj = {
          query: 'mutation signin ($username: String!, $password: String!) { signIn(username: $username, password: $password) { user } }',
          variables: { username: this.userCredentials.username, password: this.userCredentials.password },
          operationName: 'signin'
        }
        changeType = 'signIn'
      } else {
        queryObj = {
          query: 'mutation signup ($username: String!, $password: String!) { signUp(username: $username, password: $password) { user } }',
          variables: { username: this.userCredentials.username, password: this.userCredentials.password },
          operationName: 'signup'
        }
        changeType = 'signUp'
      }
      fetch('/graphql', {
        method: 'post',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(queryObj)
      }).then((response) => response.json())
        .then((graphQlRes) => {
          if (graphQlRes.data) {
            this.$store.commit('setUserState', graphQlRes.data[changeType].user)
            this.$router.push('/')
            this.$store.commit('resetAuthError')
            this.$store.commit('initStore')
          } else {
            this.$store.state.authError.error = true
            this.$store.state.authError.message = graphQlRes.errors[0].message
          }
        })
        .catch((err) => console.error(err))
    },
    showSnack (message) {
      this.snackMessage.message = message
      this.snackMessage.activate = true
    }
  }
}
</script>

<style scoped>
  h4:hover{
    text-decoration: underline;
  }
  .loginContainer{
    margin-bottom: 20vh;
    padding: 6vh 10% 0 10%;
    max-width: 850px;
  }
  .methodBtn{
    color: white;
    margin-bottom: 20px;
    text-transform: none;
    width: 250px;
  }
  .snackMessage {
    margin-top: 85px;
  }

</style>
