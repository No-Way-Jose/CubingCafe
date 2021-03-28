<template>
  <v-container class="versusContainer">
    <v-col>
      <v-row ref=videoGrid>
        <v-col cols="6">
          <video playsinline autoplay muted ref="localVideo"></video>
        </v-col>
        <v-col cols="6" v-if="waiting">
          <h1>Rules & Guidelines</h1>
          <p v-for="rule in rules" :key="rule">{{ rule }}</p>
        </v-col>
        <v-col v-else ref="oppVideo" cols="6"></v-col>
      </v-row>

      <v-row ref="scrambleRow" class="scrambleRow">
        <v-col cols="3" class="scrambleCol" align-self="center">
          <v-btn v-if="!readyBtn.userStarted" large rounded v-bind:color="scramble.myScramble" v-bind:disabled="!scramble.confirmed">{{ readyBtn.userReady }}</v-btn>
          <div ref="userStopwatch" class="timeFont"></div>
        </v-col>
        <v-col cols="6" class="scrambleCol">
          <v-row justify="center"><h1>Match Scramble:</h1></v-row>
          <v-row justify="center" class="pb-5">{{ scramble.moves }}</v-row>
          <v-row justify="center" v-if="showStart" class="py-4"><h2>Release spacebar to start your timer!</h2></v-row>
          <span ref="scrambleImage"></span>
          <v-row justify="center" ref="countdown" class="countdown"></v-row>
        </v-col>
        <v-col cols="3" class="scrambleCol" align-self="center">
          <v-btn v-if="!readyBtn.oppStarted" large rounded v-bind:color="scramble.oppScramble" @click="confirmScramble">{{ readyBtn.oppReady }}</v-btn>
          <div ref="oppStopwatch" class="timeFont"></div>
        </v-col>
      </v-row>

      <v-row class="matchControls" justify="center">
        <v-btn ref="connect" @click="connect" v-if="waiting">Find Match</v-btn>
        <v-btn ref="disconnect" @click="disconnect" v-if="!waiting">Disconnect</v-btn>
      </v-row>
    </v-col>

  </v-container>

</template>

<script>
import { api } from '../js/api.js'
import { utils } from '../js/utils.js'
import scramby from 'scramby'

export default {
  name: 'Versus',
  data: () => ({
    waiting: true,
    keysPressed: {},
    showStart: false,
    readyBtn: { userReady: 'My Scramble is good!', userStarted: false, oppReady: 'Your Scramble is good!', oppStarted: false},
    scramble: { moves: '', confirmed: false, oppScramble: 'red', myScramble: 'primary' },
    initialConnection: true,
    playerState: {},
    confirmed: false,
    matchCountdown: null,
    startOnRelease: false,
    timer: null,
    currUser: null,
    opponentUsername: { timer: null },
    opponentTimer: null,
    solveComplete: false,
    matchDetails: {},
    opponentVideo: null,
    rules: ['• No Profanity', '• Some other stuff', '• Even more stuff', '• Lol sure more rules', '• idk..', '• last one...']
  }),
  ready () {
    this.matchSetup()
  },
  beforeRouteLeave (to, from, next) {
    api.stopCamera()
    next()
  },
  created () {
    window.addEventListener('keydown', this.keyDown)
    window.addEventListener('keyup', this.keyUp)
  },
  mounted () {
    this.matchSetup()
  },
  destroyed () {
    window.removeEventListener('keydown', this.keyDown)
    window.removeEventListener('keyup', this.keyUp)
  },
  methods: {
    matchSetup () {
      console.log(this.$refs.localVideo)
      console.log('setup', this.localStreamUpdate)
      this.timer = new utils.Stopwatch(this.$refs.userStopwatch)
      this.opponentTimer = new utils.Stopwatch(this.$refs.oppStopwatch)
      this.currUser = this.$store.state.user.displayName
      api.onLocalStreamUpdate(this.localStreamUpdate);
    },
    keyDown (event) {
      if (this.keysPressed[event.code]) return
      this.keysPressed[event.code] = true
      switch (event.code) {
        case 'Space':
          event.preventDefault()
          if (this.solveComplete) return
          if (this.timer.running()) {
            this.solveComplete = true
            const solveTime = this.timer.stop()
            api.sendSolveTime(solveTime)
          } else if (this.confirmed) {
            api.sendReady()
            this.setReady('user', true)
          } else {
            // need to keep paying attention to space bar
            this.keysPressed[event.code] = false
          }
          break
      }
    },
    keyUp (event) {
      this.keysPressed[event.code] = false
      switch (event.code) {
        case 'Space':
          event.preventDefault()
          if (this.solveComplete) return
          if (this.startOnRelease) {
            this.$refs.scrambleImage.style.display = 'block'
            this.showStart = false
            this.$refs.countdown.style.display = 'none'
            this.$refs.userStopwatch.style.display = 'block'
            this.readyBtn.userStarted = true
            // this.$refs.userStopwatch.className = this.$refs.userStopwatch.className.replace('hidden', '')
            api.sendStarted()
            this.timer.start()
            this.startOnRelease = false
          } else if (this.confirmed) {
            api.sendNotReady()
            this.setReady('user', false)
          }
          break
      }
    },
    fetchScramble (scramble) {
      console.log(scramble)
      const scrambler = scramby()
      this.scramble.moves = scramble.scrambleString
      scrambler.drawScramble(this.$refs.scrambleImage, scramble.state, 500, 250)
      this.$refs.scrambleRow.style.display = 'flex'
    },
    setReady (user, ready) {
      this.playerState[user] = ready
      if (ready) {
        if (user === 'user') {
          this.readyBtn.userReady = 'Ready !'
          this.scramble.myScramble = 'green'
        } else {
          this.readyBtn.oppReady = 'Ready !'
          this.scramble.oppScramble = 'green'
        }
      } else {
        if (user === 'user') {
          this.readyBtn.userReady = 'Not Ready ...'
          this.scramble.myScramble = 'primary'
        } else {
          this.readyBtn.oppReady = 'Not Ready ...'
          this.scramble.oppScramble = 'primary'
        }
      }

      const cntdElm = this.$refs.countdown
      if (this.playerState.user && this.playerState.opponent) {
        let seconds = 5
        cntdElm.innerHTML = seconds
        this.$refs.scrambleImage.style.display = 'none'
        cntdElm.style.display = 'block'
        this.matchCountdown = setInterval(() => {
          seconds = seconds - 1
          cntdElm.innerHTML = seconds
          if (seconds <= 0) {
            this.showStart = true;
            // cntdElm.innerHTML = 'Release spacebar to start your timer'
            clearInterval(this.matchCountdown)
            this.startOnRelease = true
          }
        }, 1000)
      } else {
        this.$refs.scrambleImage.style.display = 'block'
        this.startOnRelease = false
        cntdElm.style.display = 'none'
        clearInterval(this.matchCountdown)
      }
    },
    setConfirmed (user, conf) {
      if (user === 'user') this.confirmed = conf
      if (conf) {
        if (user === 'user') {
          this.scramble.confirmed = true
        } else {
          this.scramble.oppScramble = 'primary'
        }
      }
    },
    confirmScramble () {
      this.setConfirmed('opponent', true);
      api.sendCfmScramble();
    },
    setMatchDetails (match, userKey, opponentKey) {
      this.opponentUsername = match[`${opponentKey}`]
      this.matchDetails.winElo = match[`${userKey}Win`]
      this.matchDetails.lossElo = -match[`${opponentKey}Win`]
      this.matchDetails._id = match._id
    },
    connect () {
      this.waiting = false
      if (this.initialConnection) {
        api.findMatch(this.handleMatchUpdates)
        this.initialConnection = false
      } else {
        api.findMatch()
      }
      this.$refs.connect.className += 'hidden'
      //this.$refs.disconnect.classList.remove('hidden')
    },
    disconnect () {
      api.disconnect()
      this.waiting = true
      if (this.opponentVideo) this.opponentVideo.remove()
      this.playerState = {}
      this.confirmed = false
      this.startOnRelease = false
      this.solveComplete = false
      this.matchDetails = {}
      this.timer.reset()
      this.opponentTimer.reset()
      this.setReady('opponent', false)
      this.setReady('user', false)
      this.setConfirmed('opponent', false)
      this.setConfirmed('user', false)
      this.showStart = false
      this.readyBtn = { userReady: 'My Scramble is good!', userStarted: false, oppReady: 'Your Scramble is good!', oppStarted: false}
      this.scramble = { moves: '', confirmed: false, oppScramble: 'red', myScramble: 'primary' }
      this.$refs.scrambleRow.style.display = 'none'
      this.$refs.oppStopwatch.style.display = 'none'
      this.$refs.userStopwatch.style.display = 'none'
    },
    handleMatchUpdates (obj) {
      switch (obj.action) {
        case 0: // connected to queue
          console.log(`Joined queue of size ${obj.data.queueSize}`)
          break
        case 1: // connected to a match
          console.log('Connected to match adding video stream')
          this.opponentVideo = document.createElement('video')
          this.opponentVideo.id = obj.data.id
          this.opponentVideo.srcObject = obj.data.stream
          this.opponentVideo.autoplay = true
          this.opponentVideo.style = 'width: 100%; height: 40vh; object-fit: cover; border-radius: 10px;'
          this.$refs.oppVideo.append(this.opponentVideo)
          break
        case 2: // disconnected from an opponent
          console.log('Opponent DISCONNECTED removing video stream')
          if (this.opponentVideo) this.opponentVideo.remove()
          break
        case 4: // user interaction
          switch (obj.data.action) {
            case 'NotReady':
              this.setReady('opponent', false)
              break
            case 'Ready':
              this.setReady('opponent', true)
              break
            case 'Confirmed':
              this.setConfirmed('user', true)
              break
            case 'StartedSolving':
              this.$refs.oppStopwatch.style.display = 'block'
              this.readyBtn.oppStarted = true
              // this.$refs.oppStopwatch.className = this.$refs.oppStopwatch.className.replace('hidden', '')
              this.opponentTimer.start()
              break
            case 'Solved':
              console.log(`opponent solved ${obj.data.value}`)
              this.opponentTimer.stop()
              const localTime = this.opponentTimer.getSeconds()
              const trusted = obj.data.value >= localTime - 1.5 && obj.data.value <= localTime + 1.5
              this.$refs.oppStopwatch.children[0].innerHTML = obj.data.value
              api.emitOpponentTime(this.matchDetails._id, trusted, obj.data.value)
              break
            case 'Match':
              if (obj.data.match.user1 === this.currUser) {
                this.setMatchDetails(obj.data.match, 'user1', 'user2')
              } else {
                this.setMatchDetails(obj.data.match, 'user2', 'user1')
              }
              this.fetchScramble(obj.data.match.scramble)
              api.emitMatched(this.matchDetails._id)
              break
          }
          break
        case 5: // left queue
          this.waiting = true
          break
        case 6: // match completed, result received from server
          console.log('match registered with server can do something here later')
          break
      }
    },
    localStreamUpdate (stream) {
      if (stream) {
        this.$refs.localVideo.srcObject = stream
      }
    }
  }
}
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');
  .versusContainer {
    max-width: 1400px;
    padding: 20px 50px 0 50px;
  }
  video {
    width: 100%;
    height: 40vh;
    object-fit: cover;
    border-radius: 10px;
  }
  .hidden {
    visibility: hidden;
  }
  .scrambleCol {
    text-align: center;
  }
  .timeFont {
    font-family: 'Roboto Mono', monospace;
    font-weight: bold;
    font-size: 3vw;
    text-align: center;
    display: none;
  }
  .countdown {
    font-size: 8vw;
    display: none;
  }
  .scrambleRow {
    display: none;
  }

</style>
