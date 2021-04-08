<template>

  <v-container class="timerContainer">
    <v-col>
      <v-row>
        <v-tabs centered>
          <v-tabs-slider></v-tabs-slider>
          <v-tab href="#tab-1" @click="swapMode('stopwatch')"><v-icon class="mr-3">mdi-timer-outline</v-icon>Stopwatch</v-tab>
          <v-tab href="#tab-2" @click="swapMode('countdown')"><v-icon class="mr-3">mdi-timer-sand</v-icon>Timer</v-tab>
        </v-tabs>
      </v-row>
      <v-row align="center" class="mt-0">
        <v-col>
          <v-menu transition="slide-y-transition" :offset-y="true" bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" rounded elevation="0" color="transparent"><v-icon class="mr-3" color="#1791e8">mdi-history</v-icon>History</v-btn>
            </template>
            <v-list class="history">
              <v-list-item v-if="this.$store.state.user.loggedIn" @click="newSession">
                <v-list-item-title class="newSession">New Session</v-list-item-title>
              </v-list-item>
              <v-list-item v-for="(time, idx) in timerData.history" :key="idx">
                <v-list-item-title>{{ formatTime(time) }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
        <v-col v-if="mode === 'countdown'" class="countInput">
          <v-text-field v-model="duration" label="Time in seconds..." outlined rounded></v-text-field>
        </v-col>
        <v-col class="alignRight">
          <v-menu transition="slide-y-transition" :offset-y="true" bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" rounded elevation="0" color="transparent"><v-icon class="mr-3" color="#1791e8">mdi-cube-outline</v-icon>{{ selectedSize.title }}</v-btn>
            </template>
            <v-list>
              <v-list-item v-for="item in size" :key="item.val" @click="getScramble(item)">
                <v-list-item-title class="centreTxt">{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
      <v-row class="timerRow">
        <TimerVue ref="timer" allow-overflow v-bind:type="mode" v-bind:length="countdownTime" v-slot="{ time, isDone }">
          <div ref="timerDisplay" class="timeFont">
            <span :class="{ 'flash': isDone }">
                <span>{{ time.m }}m </span>
                <span>{{ time.s }}s </span>
                <span>{{ time.ms }}ms</span>
            </span>
          </div>
        </TimerVue>
      </v-row>
      <v-row justify="center">
        <v-tooltip eager bottom color="white">
          <template v-slot:activator="{ on, attrs }">
            <p class="scramble" v-bind="attrs" v-on="on">{{ scramble }}</p>
          </template>
          <span ref="scrambleImage"></span>
        </v-tooltip>
      </v-row>
      <v-row v-if="mobile" justify="center"><v-btn class="toggleBtn" color="#1791e8" outlined rounded v-on:click="toggleClock()">Toggle</v-btn></v-row>
      <v-row class="statsRow">
        <v-col class="statHeader">Best<span class="stats">{{ formatTime(timerData.best) }}</span></v-col>
        <v-col class="statHeader">AVG 5<span class="stats">{{ formatTime(timerData.avg5) }}</span></v-col>
        <v-col class="statHeader">AVG 12<span class="stats">{{ formatTime(timerData.avg12) }}</span></v-col>
      </v-row>
    </v-col>

    <!-- Snackbar template -->
    <v-snackbar color="error" class="snackMessage" v-model="snackMessage.activate" :timeout="snackMessage.timeout"
                top right transition="slide-y-transition">{{ snackMessage.message }}
    </v-snackbar>

  </v-container>

</template>

<script>
import { TimerVue } from '@josephuspaye/timer'
import { isMobile } from 'mobile-device-detect'
import scramby from 'scramby'

export default {
  name: 'Timer',
  components: {
    TimerVue
  },
  data: () => ({
    mode: 'stopwatch',
    actionEvent: true,
    duration: 3600,
    mobile: isMobile,
    selectedSize: { title: '3 x 3', val: '333' },
    size: [{ title: '2 x 2', val: '222' }, { title: '3 x 3', val: '333' }, { title: '4 x 4', val: '444' },
      { title: '5 x 5', val: '555' }, { title: '6 x 6', val: '666' }, { title: '7 x 7', val: '777' }],
    scramble: '',
    timerData: { sessionID: '', history: [], best: 0, avg5: 0, avg12: 0 },
    snackMessage: { activate: false, message: null, timeout: 5000 },
  }),
  created () {
    window.addEventListener('keydown', this.toggleClock)
    window.addEventListener('keyup', this.toggleClock)
  },
  mounted () {
    this.getScramble()
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (vm.$store.state.user.loggedIn) {
        vm.timerData = vm.$store.state.data.timer
        if (vm.timerData.sessionID === '') vm.getLastSession()
      } else {
        vm.timerData = { sessionID: '', history: [], best: 0, avg5: 0, avg12: 0 }
      }
    })
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit('saveTimerData', this.timerData)
    next()
  },
  destroyed () {
    window.removeEventListener('keydown', this.toggleClock)
    window.removeEventListener('keyup', this.toggleClock)
  },
  computed: {
    countdownTime: function () {
      return this.duration * 1000
    }
  },
  methods: {
    formatTime (time) {
      function pad (n, z) {
        z = z || 2
        return ('00' + n).slice(-z)
      }
      const ms = time % 1000
      time = (time - ms) / 1000
      const secs = time % 60
      time = (time - secs) / 60
      const mins = time % 60
      return pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3)
    },
    async newSession() {
      const q = { query: 'mutation createsession { createSession { _id } }', operationName: 'createsession' }
      fetch('/graphql', {
        method: 'post',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      }).then((response) => response.json())
        .then((graphQlRes) => {
          if (graphQlRes.data) {
            this.timerData = { sessionID: '', history: [], best: 0, avg5: 0, avg12: 0 }
            this.timerData.sessionID = graphQlRes.data.createSession._id
          } else {
            this.showSnack(graphQlRes.errors[0].message)
          }
        })
        .catch((err) => console.log(err))
    },
    async getLastSession () {
      const q = { query: 'query getsession { getSession { _id } }', operationName: 'getsession' }
      fetch('/graphql', {
        method: 'post',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      }).then((response) => response.json())
        .then((graphQlRes) => {
          if (graphQlRes.data) {
            this.timerData.sessionID = graphQlRes.data.getSession._id
            this.getLastSolves()
          } else {
            this.showSnack(graphQlRes.errors[0].message)
          }
        })
        .catch((err) => console.log(err))
    },
    async getLastSolves () {
      const q = { query: 'query solvemany ($session: MongoID) { solveMany(filter: { session: $session })  { time } }',
        variables: { session: this.timerData.sessionID },
        operationName: 'solvemany' }
      fetch('/graphql', {
        method: 'post',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      }).then((response) => response.json())
        .then((graphQlRes) => {
          if (graphQlRes.data) {
            this.timerData.history = graphQlRes.data.solveMany.reverse().map(function (obj) {
              return obj.time
            })
            this.updateStats()
          } else {
            this.showSnack(graphQlRes.errors[0].message)
          }
        })
        .catch((err) => console.log(err))
    },
    async saveTime(time) {
      const size = '_' + this.selectedSize.val.charAt(0) + 'x' + this.selectedSize.val.charAt(0)
      const timeObj = {
        query: 'mutation insertsolve ($time: Float!, $session: MongoID!, $size: EnumSolveSize) { ' +
          'insertSolve(record: {time: $time, session: $session, size: $size }) ' +
          '{ record { time, session, user, createdAt } } }',
        variables: { time: time, session: this.timerData.sessionID, size: size },
        operationName: 'insertsolve'
      }
      fetch('/graphql', {
        method: 'post',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(timeObj)
      }).then((response) => response.json())
        .then((graphQlRes) => {
          if (graphQlRes.data) {
            this.timerData.history.unshift(time)
            this.updateStats()
          } else {
            this.showSnack(graphQlRes.errors[0].message)
          }
        })
        .catch((err) => console.log(err))
    },
    swapMode (mode) {
      this.mode = mode
      if (mode === 'stopwatch') {
        this.duration = 3600
      } else {
        this.duration = 0
      }
      this.$refs.timer.reset()
    },
    toggleClock (event) {
      const state = this.$refs.timer.state
      if (this.mobile) {
        if (state === 'running') {
          this.$refs.timer.stop()
          this.timerData.history.unshift(this.$refs.timer.timeElapsed)
        } else if (state === 'stopped') {
          this.$refs.timer.start()
        }
      } else if (event.keyCode === 32) {
        event.preventDefault()
        // CSS styling to change timer color green on ready
        if (state === 'stopped' && event.type === 'keydown') this.$refs.timerDisplay.className += ' ready'
        if (state === 'stopped' && event.type === 'keyup') this.$refs.timerDisplay.className = 'timeFont'
        // Handle the timer functionality
        if (state === 'running' && event.type === 'keydown') {
          this.$refs.timer.stop()
        } else if (state === 'stopped' && event.type === 'keyup' && this.actionEvent) {
          this.$refs.timer.start()
          this.actionEvent = false
        }
      } else if (event.keyCode === 13 && event.type === 'keydown') {
        if (this.mode === 'stopwatch') {
          if (this.$store.state.user.loggedIn) {
            this.saveTime(this.$refs.timer.timeElapsed)
          } else {
            this.timerData.history.unshift(this.$refs.timer.timeElapsed)
            this.updateStats()
          }
        }
        this.$refs.timer.reset()
        this.actionEvent = true
        this.getScramble()
      } else if (event.keyCode === 8 && event.type === 'keydown') {
        this.$refs.timer.reset()
        this.actionEvent = true
      }
    },
    getScramble (cubeSize) {
      if (cubeSize) this.selectedSize.val = cubeSize.val
      this.selectedSize.Title = cubeSize.Title
      const scrambler = scramby(this.selectedSize.val)
      const state = scrambler.getRandomScramble()
      this.scramble = state.scrambleString
      scrambler.drawScramble(this.$refs.scrambleImage, state.state, 500, 250)
    },
    updateStats () {
      // Clear the stats
      this.timerData.best = 0
      this.timerData.avg5 = 0
      this.timerData.avg12 = 0
      // Update best
      if (this.timerData.history.length >= 1) {
        this.timerData.best = Math.min(...this.timerData.history)
      }
      // Update avg 5
      if (this.timerData.history.length >= 5) {
        this.timerData.avg5 = Math.floor((this.timerData.history.slice(-5).reduce((sum, time) => sum + time) / 5))
      }
      // Update avg 12
      if (this.timerData.history.length >= 12) {
        this.timerData.avg12 = Math.floor((this.timerData.history.slice(-12).reduce((sum, time) => sum + time)) / 12)
      }
    },
    msToTime (s) {
      function pad (n, z) {
        z = z || 2
        return ('00' + n).slice(-z)
      }
      const ms = s % 1000
      s = (s - ms) / 1000
      const secs = s % 60
      s = (s - secs) / 60
      const mins = s % 60
      return pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3)
    },
    showSnack (message) {
      this.snackMessage.message = message
      this.snackMessage.activate = true
    }
  }
}
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
  .timerContainer {
    max-width: 2000px;
    padding: 20px 50px;
  }
  .timeFont {
    font-family: 'Share Tech Mono', monospace;
    font-weight: bold;
    font-size: 9vw;
  }
  .ready {
    color: mediumseagreen;
  }
  .timerRow {
    text-align: center;
    justify-content: center;
    padding-top: 12vh;
  }
  .history {
    max-height: 50vh;
    overflow-y: auto;
  }
  .statsRow {
    padding-top: 20vh;
  }
  .alignRight {
    text-align: right;
  }
  .countInput {
    max-width: 40%;
    padding-top: 35px;
  }
  .statHeader {
    text-align: center;
    font-size: 1.5vw;
    font-weight: bold;
    color: grey;
  }
  .stats {
    color: black;
    padding-left: 20px;
    font-size: 1.6vw;
  }
  .centreTxt {
    text-align: center;
  }
  .scramble {
    font-size: 1.5vw;
    color: grey;
    text-align: center;
  }
  .scramble:hover {
    cursor: pointer;
  }
  .toggleBtn {
    margin-top: 15vh;
    width: 75%;
    min-height: 25vh;
  }
  .newSession {
    color: #0275d8;
    font-weight: bold;
  }
  .snackMessage {
    margin-top: 85px;
  }
  .flash {
    color: red;
    animation-name: flash;
    animation-duration: 1.3s;
    animation-iteration-count: 2;
  }
  @keyframes flash {
    from,
    50%,
    to {
      opacity: 1;
    }
    25%,
    75% {
      opacity: 0;
    }
  }
</style>
