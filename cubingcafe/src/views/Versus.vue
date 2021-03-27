<template>
  <v-container class="versusContainer">
    <v-col>
      <v-row ref="statusRow" v-bind:class="{ hidden: waiting }">
        <v-col>
          <div ref="userReady" class="ready-label">Not Ready</div>
          <div ref="userStopwatch" class="hidden timeFont"></div>
        </v-col>
        <v-col>
          <div ref="opponentReady" class="ready-label">Not Ready</div>
          <div ref="oppStopwatch" class="hidden timeFont"></div>
        </v-col>
      </v-row>

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

      <v-row ref="scrambleRow" class="hidden">
        <v-col cols="3" class="scrambleCol" align-self="center">
          <v-btn large rounded outlined color="green" v-bind:disabled="!scramble.confirmed">My Scramble is good!</v-btn>
        </v-col>
        <v-col cols="6" class="scrambleCol">
          <v-row justify="center"><h1>Match Scramble:</h1></v-row>
          <v-row justify="center" class="pb-5">{{ scramble.moves }}</v-row>
          <span ref="scrambleImage"></span>
        </v-col>
        <v-col cols="3" class="scrambleCol" align-self="center">
          <v-btn large rounded outlined v-bind:color="scramble.oppScramble" @click="confirmScramble">Your Scramble is good!</v-btn>
        </v-col>
      </v-row>

      <v-row ref='countdown' class='hidden'></v-row>
      <v-row class="matchControls">
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
    scramble: { moves: '', confirmed: false, oppScramble: 'primary' },
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
      this.timer = new utils.Stopwatch(this.$refs.userStopwatch)
      this.opponentTimer = new utils.Stopwatch(this.$refs.oppStopwatch)
      this.currUser = this.$store.state.user.displayName
      api.onLocalStreamUpdate(this.localStreamUpdate);
    },
    keyDown (event) {
      event.preventDefault()
      if (this.keysPressed[event.code]) return
      this.keysPressed[event.code] = true
      switch (event.code) {
        case 'Space':
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
      event.preventDefault()
      this.keysPressed[event.code] = false
      switch (event.code) {
        case 'Space':
          if (this.solveComplete) return
          if (this.startOnRelease) {
            this.$refs.userStopwatch.className = this.$refs.userStopwatch.className.replace('hidden', '')
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
    fetchScramble () {
      const scrambler = scramby(this.selectedSize)
      const state = scrambler.getRandomScramble()
      this.scramble.moves = state.scrambleString
      scrambler.drawScramble(this.$refs.scrambleImage, state.state, 500, 250)
      this.$refs.scrambleRow.className = this.$refs.scrambleRow.className.replace('hidden', '')
    },
    setReady (user, ready) {
      const elm = this.$refs[`${user}Ready`]
      this.playerState[user] = ready
      if (ready) {
        elm.className += 'ready'
        elm.innerHTML = 'Ready'
      } else {
        elm.className.replace('/\bready\b/g', '')
        elm.innerHTML = 'Not Ready'
      }

      const cntdElm = this.$refs.countdown
      if (this.playerState.user && this.playerState.opponent) {
        let seconds = 5
        cntdElm.innerHTML = seconds
        cntdElm.className.replace('hidden', '')
        this.matchCountdown = setInterval(() => {
          seconds = seconds - 1
          cntdElm.innerHTML = seconds
          if (seconds <= 0) {
            cntdElm.innerHTML = 'Release spacebar to start your timer'
            clearInterval(this.matchCountdown)
            this.startOnRelease = true
          }
        }, 1000)
      } else {
        this.startOnRelease = false
        cntdElm.className += 'hidden'
        clearInterval(this.matchCountdown)
      }
    },
    setConfirmed (user, conf) {
      if (user === 'user') this.confirmed = conf
      if (conf) {
        if (user === 'user') {
          this.scramble.confirmed = true
        } else {
          this.scramble.oppScramble = 'green'
        }
      }
    },
    confirmScramble () {
      console.log('Confirmed scramble!')
      this.setConfirmed('opponent', true);
      api.sendCfmScramble();
      this.$refs.confirmOppScramble.className += 'hidden';
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
      this.$refs.connect.className = this.$refs.connect.className.replace('hidden', '')
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
          this.opponentVideo.style = 'width: 100%; height: 40vh; object-fit: cover;'
          this.$refs.oppVideo.append(this.opponentVideo)
          this.fetchScramble()
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
              this.$refs.oppStopwatch.className = this.$refs.oppStopwatch.className.replace('hidden', '')
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
              api.emitMatched(this.matchDetails._id)
              break
          }
          break
        case 5: // left queue
          this.$refs.disconnect.className += 'hidden'
          this.$refs.connect.className = this.$refs.connect.className.replace('hidden', '')
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
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
  .versusContainer {
    max-width: 1400px;
    padding: 20px 50px 0 50px;
  }
  video {
    width: 100%;
    height: 40vh;
    object-fit: cover;
  }
  .hidden {
    visibility: hidden;
  }
  .scrambleCol {
    text-align: center;
  }
  .timeFont {
    font-family: 'Share Tech Mono', monospace;
    font-weight: bold;
    font-size: 3vw;
    text-align: center;
  }

</style>
