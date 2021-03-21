import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: 'Home | CubingCafe' }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { title: 'Login | CubingCafe' }
    },
    {
      path: '/solver',
      name: 'solver',
      component: () => import('../views/Solver.vue'),
      meta: { title: 'Solver | CubingCafe' }
    },
    {
      path: '/timer',
      name: 'timer',
      component: () => import('../views/Timer.vue'),
      meta: { title: 'Timer | CubingCafe' }
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: () => import('../views/Leaderboard.vue'),
      meta: { title: 'Leaderboard | CubingCafe' }
    },
    {
      path: '/myprofile',
      name: 'myprofile',
      component: () => import('../views/Profile.vue'),
      meta: { title: 'MyProfile | CubingCafe' }
    },
    {
      path: '*',
      redirect: '/'
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})

// Change the tab title based on what page we are on after navigating to it
router.afterEach((to, from) => {
  document.title = to.meta.title
})

export default router
