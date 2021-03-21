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
            <v-list>
              <v-list-item v-for="item in history" :key="item">
                <v-list-item-title>{{ item }}</v-list-item-title>
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
              <v-btn v-on="on" rounded elevation="0" color="transparent"><v-icon class="mr-3" color="#1791e8">mdi-cube-outline</v-icon>Size</v-btn>
            </template>
            <v-list>
              <v-list-item v-for="item in size" :key="item.val" @click="getScramble(item.val)">
                <v-list-item-title class="popupMenu">{{ item.title }}</v-list-item-title>
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
        <v-col class="statHeader">Best<span class="stats">--</span></v-col>
        <v-col class="statHeader">AVG 5<span class="stats">--</span></v-col>
        <v-col class="statHeader">AVG 12<span class="stats">--</span></v-col>
      </v-row>
    </v-col>
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
    selectedSize: '333',
    size: [{ title: '2 * 2', val: '222' }, { title: '3 * 3', val: '333' }, { title: '4 * 4', val: '444' },
      { title: '5 * 5', val: '555' }, { title: '6 * 6', val: '666' }, { title: '7 * 7', val: '777' }],
    history: [],
    scramble: 'U\' F2 U2 F B\' D F L U2 B U2 R2 B2 R\' F L R D R2 F\' R2 B2 L\' F R2'
  }),
  created () {
    window.addEventListener('keydown', this.toggleClock)
    window.addEventListener('keyup', this.toggleClock)
  },
  destroyed () {
    window.removeEventListener('keydown', this.toggleClock)
    window.removeEventListener('keyup', this.toggleClock)
  },
  computed: {
    countdownTime: function () {
      return this.duration * 1000
    },
    cubeURL: function () {
      return 'http://cube.rider.biz/visualcube.php?fmt=svg&size=350&pzl=' + this.selectedSize[0] + '&alg=' + this.scramble.replace(' ', '')
    }
  },
  methods: {
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
          this.history.push(this.$refs.timer.timeElapsed)
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
        if (this.mode === 'stopwatch') this.history.push(this.msToTime(this.$refs.timer.timeElapsed))
        this.$refs.timer.reset()
        this.actionEvent = true
        this.getScramble()
      } else if (event.keyCode === 8 && event.type === 'keydown') {
        this.$refs.timer.reset()
        this.actionEvent = true
      }
    },
    getScramble (cubeSize) {
      if (cubeSize) this.selectedSize = cubeSize
      const scrambler = scramby(this.selectedSize)
      const state = scrambler.getRandomScramble()
      this.scramble = state.scrambleString
      scrambler.drawScramble(this.$refs.scrambleImage, state.state, 500, 250)
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
