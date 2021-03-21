<template>
  <v-app>
    <v-main>
      <v-app-bar height="90" class="px-5" elevation="0" color="white">
        <v-toolbar-title class="mt-2 mr-6 pr-12" v-on:click="$router.push('/')">CubingCafe</v-toolbar-title>
        <router-link v-for="page in pages" :key="page.link" exact :to="page.link" class="mt-4 mb-2 mr-7">{{ page.page }}</router-link>
        <v-spacer/>

        <v-menu v-if="$store.state.user.loggedIn" transition="slide-y-transition" :offset-y="true" bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" rounded elevation="0" color="transparent"><v-icon class="mr-3" color="#1791e8">mdi-account</v-icon>{{ $store.state.user.displayName }}</v-btn>
          </template>
          <v-list>
            <v-list-item v-for="(item, i) in dropDown" :key="i" @click="executeOptions(item.page)">
              <v-list-item-title class="popupMenu">{{ item.option }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-btn v-else elevation="0" v-on:click="$router.push('login')" color="transparent" rounded><v-icon class="mr-3" color="#1791e8">mdi-account</v-icon>Login</v-btn>
      </v-app-bar>
      <v-container class="contentContainer">
        <router-view/>
      </v-container>
      <v-footer class="font-weight-medium pa-0" style="justify-content: center" elevation="9" color="#1791e8">
        <v-row class="footerBar ma-0">
          <v-row class="ma-0">
            <v-col class="footerText" cols="10">
              <strong>Copyright © {{ new Date().getFullYear() }}  CubingCafe. All rights reserved.</strong>
            </v-col>
          </v-row>
        </v-row>
      </v-footer>

    </v-main>
  </v-app>
</template>

<script>
import { auth } from './main'
export default {
  name: 'App',
  data: () => ({
    pages: [
      { page: 'Solver', link: 'solver' },
      { page: 'Timer', link: 'timer' },
      { page: 'Leaderboards', link: 'leaderboard' },
      { page: 'Online Versus', link: 'versus' }
    ],
    dropDown: [
      { option: 'MyProfile', page: '/myprofile' },
      { option: 'Logout', page: 'logout' }
    ]
  }),
  methods: {
    logout () {
      auth.signOut().then(() => {
        this.$store.commit('setUserState', false)
        if (this.$route.name !== 'home') {
          this.$router.push('/')
        } else {
          location.reload()
        }
      })
    },
    executeOptions (option) {
      // Determine if navigating to new page or logging out
      if (option !== 'logout') {
        this.$router.push(option)
      } else {
        this.logout()
      }
    }
  }
}
</script>

<style>
  .contentContainer{
    min-width: 100%;
    min-height: calc(100vh - 90px);
    padding-bottom: 25px;
  }
  .v-application a {
    font-weight: bold;
    font-size: 18px;
    text-decoration: none;
  }
  .router-link-active{
    border-bottom: 2px solid #1791e8;
    border-radius: 2px;
  }
</style>
