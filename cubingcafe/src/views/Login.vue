<template>
  <v-container class="loginContainer">
    <div v-if="screen === 'SignUp'">
      <v-row justify="center" style="text-align: center">
        <h1>Join Cubing Cafe now</h1>
      </v-row>
      <v-row justify="center" style="text-align: center">
        <p class="my-7">View, Explore, and track Korean & Chinese dramas!</p>
      </v-row>
      <v-row justify="center" class="mt-4 mb-2">
        <v-btn class="methodBtn" color="#1791e8" @click="authGoogle"><v-icon class="mx-2">mdi-google</v-icon>Continue with Google</v-btn>
      </v-row>
      <v-row justify="center">
        <v-btn class="methodBtn" color="#1791e8" @click="screen = 'SuEmail'"><v-icon class="mx-2">mdi-email</v-icon>Sign up with Email</v-btn>
      </v-row>
    </div>
    <div v-if="screen === 'Login'">
      <v-row justify="center" style="text-align: center">
        <h1>Login to Cubing Cafe</h1>
      </v-row>
      <v-row justify="center" style="text-align: center">
        <p class="my-7">Login with either your Google account, or email address</p>
      </v-row>
      <v-row justify="center" class="mt-4 mb-2">
        <v-btn class="methodBtn" color="#1791e8" @click="authGoogle"><v-icon class="mx-2">mdi-google</v-icon>Continue with Google</v-btn>
      </v-row>
      <v-row justify="center">
        <v-btn class="methodBtn" color="#1791e8" @click="screen = 'LgEmail'"><v-icon class="mx-2">mdi-email</v-icon>Login with Email</v-btn>
      </v-row>
    </div>
    <div v-if="screen === 'LgEmail'">
      <v-row justify="center" style="text-align: center">
        <h1>Login to Cubing Cafe</h1>
      </v-row>
      <v-row justify="center" class="pb-3">
        <p class="my-7">Login using your email address and password</p>
      </v-row>
      <ValidationObserver ref="observer" v-slot="{ validate }">
        <form>
          <ValidationProvider v-slot="{ errors }" name="Email" rules="required|email">
            <v-text-field
              color="#1791e8" prepend-inner-icon="mdi-email" placeholder="E-mail" :error-messages="errors"
              v-model="userCredentials.email" required solo
            ></v-text-field>
          </ValidationProvider>
          <ValidationProvider v-slot="{ errors }" name="Password" rules="required|min:8">
            <v-text-field
              color="#1791e8" prepend-inner-icon="mdi-lock" placeholder="Password" :error-messages="errors"
              v-model="userCredentials.password" type="Password" required solo counter
            ></v-text-field>
          </ValidationProvider>
          <v-row style="justify-content: flex-end; color: dimgrey" class="pr-4 py-2" @click="screen = 'ResetPass'"><h4>Forgot my password</h4></v-row>
          <v-alert v-if="authError" type="error" text dense outlined border="left" class="mt-5" icon="mdi-alert-outline">
            {{ $store.state.authError.message }}
          </v-alert>
          <v-row justify="center"><v-btn class="mt-6 mr-4 methodBtn" color="#1791e8" @click="submit">Login</v-btn></v-row>
        </form>
        <a v-if="validate"></a>
      </ValidationObserver>
    </div>
    <div v-if="screen === 'SuEmail'">
      <v-row justify="center" style="text-align: center">
        <h1>Join Cubing Cafe now</h1>
      </v-row>
      <v-row justify="center" class="pb-3">
        <p class="my-7">Sign up using your email, and create a username</p>
      </v-row>
      <ValidationObserver ref="observer" v-slot="{ validate }">
        <form>
          <ValidationProvider v-slot="{ errors }" name="Email" rules="required|email">
            <v-text-field
              color="#932432" prepend-inner-icon="mdi-email" placeholder="E-mail" :error-messages="errors"
              v-model="userCredentials.email" required solo
            ></v-text-field>
          </ValidationProvider>
          <ValidationProvider v-slot="{ errors }" name="Password" rules="required|min:8">
            <v-text-field
              color="#932432" prepend-inner-icon="mdi-lock" placeholder="Password" :error-messages="errors"
              v-model="userCredentials.password" type="Password" required solo counter
            ></v-text-field>
          </ValidationProvider>
          <v-row v-if="authError" style="color: crimson" class="pt-5">{{ $store.state.authError.message }}</v-row>
          <v-row justify="center"><v-btn class="mt-6 mr-4 methodBtn" color="#1791e8" @click="submit">Sign Up</v-btn></v-row>
        </form>
        <a v-if="validate"></a>
      </ValidationObserver>
    </div>
    <div v-if="screen === 'ResetPass'">
      <v-row justify="center" style="text-align: center">
        <h1>Reset Cubing Cafe password</h1>
      </v-row>
      <v-row justify="center" class="pb-3">
        <p class="my-7">Enter the email associated with your account and an email to reset your password will be sent to you!</p>
      </v-row>
      <v-text-field
        color="#932432" prepend-inner-icon="mdi-email" placeholder="E-mail" v-model="userCredentials.email" required solo
      ></v-text-field>
      <p v-if="authError" style="color: crimson" class="pt-2">{{ $store.state.authError.message }}</p>
      <v-row justify="center"><v-btn class="mt-6 mr-4 methodBtn" color="#1791e8" @click="resetPassword">Send Email</v-btn></v-row>
      <v-row justify="center">
        <v-divider class="my-7" style="max-width: 450px;"/>
      </v-row>
      <v-row justify="center"><v-btn class="mr-4 methodBtn" color="#1791e8" text outlined @click="screen = 'Login'">Go Back</v-btn></v-row>
    </div>
    <div v-if="screen === 'SuEmail' || screen === 'SignUp'">
      <v-row justify="center">
        <v-divider class="my-7" style="max-width: 450px;"/>
      </v-row>
      <v-row justify="center"><p>Already a member?</p></v-row>
      <v-row justify="center"><v-btn class="methodBtn" color="#1791e8" text outlined @click="screen = 'Login'">Login</v-btn></v-row>
    </div>
    <div v-if="screen === 'LgEmail' || screen === 'Login'">
      <v-row justify="center">
        <v-divider class="my-7" style="max-width: 450px;"/>
      </v-row>
      <v-row justify="center"><p>Don't have an account?</p></v-row>
      <v-row justify="center"><v-btn class="methodBtn" color="#1791e8" text outlined @click="screen = 'SignUp'">Sign Up</v-btn></v-row>
    </div>

    <!-- Snackbar template -->
    <v-snackbar color="#1791e8" v-model="snackMessage.activate" :timeout="snackMessage.timeout"
                absolute style="padding-left: 12%" elevation="10">{{ snackMessage.message }}
    </v-snackbar>

  </v-container>

</template>

<script>
import { auth, googleAuth } from '../main'
import { api } from '../js/api.js'

export default {
  name: 'Login',
  data () {
    return {
      screen: 'SignUp',
      userCredentials: { email: '', password: '' },
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
          if (this.screen === 'LgEmail') {
            this.login(false)
          } else {
            this.signUp()
          }
        } else {
          alert('Invalid Input. Try Again...')
        }
      })
    },
    login (firstLogin) {
      const res = api.signin(this.userCredentials.email.substring(0, this.userCredentials.email.indexOf('@')), this.userCredentials.password)
      console.log(res)
      auth.signInWithEmailAndPassword(this.userCredentials.email, this.userCredentials.password)
        .then(data => {
          this.$router.push('/')
          this.$store.commit('resetAuthError')
        })
        .catch(err => {
          this.$store.state.authError.error = true
          this.$store.state.authError.message = err.message
        })
    },
    signUp () {
      const res = api.signup(this.userCredentials.email.substring(0, this.userCredentials.email.indexOf('@')), this.userCredentials.password)
      console.log(res)
      auth.createUserWithEmailAndPassword(this.userCredentials.email, this.userCredentials.password)
        .then(data => {
          this.login(true)
        })
        .catch(err => {
          this.$store.state.authError.error = true
          this.$store.state.authError.message = err.message
        })
    },
    resetPassword () {
      auth.sendPasswordResetEmail(this.userCredentials.email).then(result => {
        this.$store.commit('resetAuthError')
        this.screen = 'LgEmail'
        this.showSnack('Email was sent!')
      }).catch(err => {
        this.$store.state.authError.error = true
        this.$store.state.authError.message = err.message
      })
    },
    authGoogle () {
      auth.signInWithRedirect(googleAuth)
      auth.getRedirectResult().then(result => {
        this.$router.push('/')
      }).catch(err => {
        this.$store.state.authError.error = true
        this.$store.state.authError.message = err.message
      })
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

</style>
