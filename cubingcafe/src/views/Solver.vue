<template>
  <v-container class="solverContainer">
    <!-- Snackbar template -->
    <v-snackbar class="snackMessage" v-bind:color="snackColour" v-model="snackMessage.activate" :timeout="snackMessage.timeout" top right transition="slide-y-transition">
      {{ snackMessage.message }}
    </v-snackbar>

    <v-row justify="center" class="pb-12">
      <v-row class="rubiksInput">
        <v-col v-for="face in 12" :key="face" class="d-flex child-flex" cols="3">
          <v-row v-if="String(face) in colours" class="py-3">
            <v-col v-for="n in 9" :key="n" class="d-flex child-flex" cols="4">
              <div v-if="n === 5" v-aspect-ratio="'1:1'" v-bind:ref="String(face) + '-' + String(n)" class="centerBlock" v-bind:class="colours[face].class"></div>
              <div v-else v-aspect-ratio="'1:1'" v-bind:ref="String(face) + '-' + String(n)" class="block" v-bind:class="colours[face].class" v-on:click="changeColour(+ String(face) + '-' + String(n))"></div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-row>

    <v-row class="my-12">
      <v-col cols="5" class="pr-12">
        <v-row><h1>Scramble Input</h1></v-row>
        <v-row class="pt-3 pr-6">
          <p>Note: The given scramble may only contain the standard cube face notations [R, L, F, B , U, D].
            Prime/counterclockwise moves as well as double rotations should be indicated using X' or X2 accordingly,
            where where X is a valid cube face.
          </p>
        </v-row>
        <v-row class="pt-2 pr-2">
          <v-text-field v-model="scrambleInput" label="Enter scramble..."></v-text-field>
        </v-row>
      </v-col>
      <v-col cols="7" class="pl-6">
        <v-row><h1>Colour Selector</h1></v-row>
        <v-row>
          <v-col v-for="option in options" :key="option.label" cols="12" sm="4" md="2">
            <v-checkbox v-model="selectedColour" v-bind:label="option.label" v-bind:color="option.colour" v-bind:value="option.value"></v-checkbox>
          </v-col>
        </v-row>
        <v-row><h1>Options</h1></v-row>
        <v-row class="pt-3 pl-2">
          <v-btn @click="performScramble()" color="warning" class="mr-5">View Scramble</v-btn>
          <v-btn @click="solve()" color="info" class="mr-5" v-scroll-to="scrollTo('solution')">Solve!</v-btn>
          <v-btn @click="reset()" color="error">Reset</v-btn>
        </v-row>

      </v-col>
    </v-row>

    <v-row justify="center" class="pt-4" v-bind:class="{ hidden: notSolved }"><v-divider class="pt-12 my-12"/></v-row>
    <v-row id="solution" class="cubePreview" v-bind:class="{ hidden: notSolved }">
      <v-col>
        <v-row><h1>Cube Preview</h1></v-row>
        <v-row ref="cubePreview" justify="center"></v-row>
        <v-row justify="center" class="pt-5">
          <v-btn large rounded outlined color="primary" @click="rotateCube">
            <v-icon>mdi-axis-z-rotate-clockwise</v-icon>
          </v-btn>
        </v-row>
      </v-col>
    </v-row>

    <v-row class="pt-6" v-bind:class="{ hidden: notSolved }"><h1>Solution</h1></v-row>
    <v-row class="pb-6" v-bind:class="{ hidden: notSolved }"><h3>* Start with green facing you and white on the bottom</h3></v-row>
    <v-row ref="cubeImg" v-bind:class="{ hidden: notSolved }"></v-row>
    <v-row v-bind:class="{ hidden: notSolved }">
      <v-col cols="8">
        <v-expansion-panels>
          <v-expansion-panel v-for="(steps, idx) in instructions" :key="idx">
            <v-expansion-panel-header><h3 class="stepHeader">{{ headers[idx].step }}</h3></v-expansion-panel-header>
            <v-expansion-panel-content class="py-2">
              <v-row>
                <v-col cols="10" class="pl-3">
                  <p v-if="steps.join('').length === 0">Lucky you! You got a {{ headers[idx].moves }} skip</p>
                  <p v-else v-for="(step, ix) in steps" :key="ix">{{ step }}</p>
                </v-col>
                <v-col cols="2" align-self="center">
                  <v-btn color="primary" @click="generatePreview(currentState.sol + currentState.states[headers[idx].moves])">View</v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col cols="4">
        <v-card class="pa-2 pb-4">
          <v-card-title>Rubiks Cube Notation</v-card-title>
          <v-row class="py-4 pl-6">Cube Turns</v-row>
          <v-card-text class="px-6">
            <v-row>• X: A 90-degree clockwise turn of the X face</v-row>
            <v-row>• X': A 90-degree counterclockwise turn of the X face</v-row>
            <v-row>• X2: A 180-degree turn (either clockwise or counterclockwise) of the X face</v-row>
          </v-card-text>
          <v-row class="py-4 pl-6">Cube Faces</v-row>
          <v-card-text class="px-6">
            <v-row>
              <v-col>• F: The front face (Green)</v-col><v-col>• B: The back face (Blue)</v-col>
            </v-row>
            <v-row>
              <v-col>• R: The right face (Red)</v-col><v-col>• L: The left face (Orange)</v-col>
            </v-row>
            <v-row>
              <v-col>• U: The top face (Yellow)</v-col><v-col>• D: The bottom face (White)</v-col>
            </v-row>
          </v-card-text>
          <v-row class="py-4 pl-6">Slice Turns</v-row>
          <v-card-text class="px-6">
            <v-row>• M: a move of the Middle layer (Between R and L), in the same direction as an L turn</v-row>
            <v-row>• E: a move of the Equatorial layer (Between U and D), in the same direction as a D turn</v-row>
            <v-row>• S: a move of the Standing layer (between F and B), in the same direction as an F turn</v-row>
          </v-card-text>
          <v-row class="py-4 pl-6">Combination Turns</v-row>
          <v-card-text class="px-6">
            <v-row>• r: a move of the Right & Middle layer</v-row>
            <v-row>• b: a move of the Back & Standing layer</v-row>
            <v-row>• Similar logic applies to the remaining lowercase notations</v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

</template>

<script>
import solver from 'rubiks-cube-solver'
import { cubePNG } from 'sr-visualizer'

export default {
  name: 'Solver',
  data: () => ({
    selectedColour: 'redBlock',
    notSolved: true,
    snackColour: 'error',
    colours: {
      6: { class: 'greenBlock', limit: 9, idx: 0 },
      7: { class: 'redBlock', limit: 9, idx: 1 },
      2: { class: 'whiteBlock', limit: 9, idx: 2 },
      10: { class: 'yellowBlock', limit: 9, idx: 3 },
      5: { class: 'orangeBlock', limit: 9, idx: 4 },
      8: { class: 'blueBlock', limit: 9, idx: 5 },
    },
    options: [
      { label: 'Red', colour: 'red', value: 'redBlock' },
      { label: 'Orange', colour: 'orange', value: 'orangeBlock' },
      { label: 'Blue', colour: 'blue', value: 'blueBlock' },
      { label: 'Green', colour: 'green', value: 'greenBlock' },
      { label: 'Yellow', colour: 'yellow', value: 'yellowBlock' },
      { label: 'White', colour: 'grey', value: 'whiteBlock' }
    ],
    headers: [
      { step: 'C: Cross', moves: 'cross'},
      { step: 'F: F2L (First 2 Layers)', moves: 'f2l'},
      { step: 'O: OLL (Orient Last Layer)', moves: 'oll'},
      { step: 'P: PLL (Permute Last Layer)', moves: 'pll'}
      ],
    instructions: [],
    currentState: { alg: '', sol: '', states: { cross: '', f2l: '', oll: '', pll: '' } },
    moveMask: { 'u\'': '2Uw\'', 'u': '2Uw', 'b': '2Bw', 'b\'': '2Bw\'', 'd': '2Dw', 'd\'': '2Dw\'' },
    snackMessage: { activate: false, message: null, timeout: 5000 },
    scrambleInput: null,
    validMoves: 'RLBDUF'
  }),
  methods: {
    performMove (move, counterClockwise) {
      const moveToFace = { 'R': 7, 'L': 5, 'U': 2, 'D': 10, 'F': 6, 'B': 8 }
      let face = moveToFace[move]
      const faceRotation = [[1, 3], [2, 6], [3, 9], [6, 8], [9, 7], [8, 4], [7, 1], [4, 2]]
      let faceColours = []
      for (let i = 1; i < 10; i++) {
        const block = String(face) + '-' + String(i)
        faceColours.push(this.$refs[block][0].className)
      }
      faceRotation.forEach((item) => {
        let target = counterClockwise ? 0 : 1
        let source = counterClockwise ? 1 : 0
        const block = String(face) + '-' + String(item[target])
        this.$refs[block][0].className = faceColours[item[source]-1]
      });

      const rotateMapping = {
        2: { 'g': [1,2,3], 'o': [1,2,3], 'b': [1,2,3], 'r': [1,2,3] },
        5: { 'b': [3,6,9], 'w': [7,4,1], 'g': [7,4,1], 'y': [7,4,1] },
        6: { 'o': [3,6,9], 'w': [9,8,7], 'r': [7,4,1], 'y': [1,2,3] },
        7: { 'g': [3,6,9], 'w': [3,6,9], 'b': [7,4,1], 'y': [3,6,9] },
        8: { 'r': [3,6,9], 'w': [1,2,3], 'o': [7,4,1], 'y': [9,8,7] },
        10: { 'o': [9,8,7], 'g': [9,8,7], 'r': [9,8,7], 'b': [9,8,7] },
      }

      let firstFace = null;  // use this to know the key for the starting face
      let currFaceColours = [null, null, null];
      let prevFaceColours = [null, null, null];

      const positionsToMove = rotateMapping[face];
      let faceSequence = Object.keys(positionsToMove);
      if (counterClockwise) {
          faceSequence.reverse();
      }
      faceSequence.forEach((currFace) => {
        face = Object.keys(this.colours).find(key => this.colours[key].class.substring(0,1) === currFace)
        prevFaceColours = [...currFaceColours];
        for (let i = 0; i < 3; i++) {
          const block = String(face) + '-' + String(positionsToMove[currFace][i])
          currFaceColours[i] = this.$refs[block][0].className;
        }
        if (!firstFace) firstFace = currFace;
        else {
            for (let i = 0; i < 3; i++) {
              const block = String(face) + '-' + String(positionsToMove[currFace][i])
              this.$refs[block][0].className = prevFaceColours[i]
            }
        }
      });
      face = Object.keys(this.colours).find(key => this.colours[key].class.substring(0,1) === firstFace)
      for (let i = 0; i < 3; i++) {
        const block = String(face) + '-' + String(positionsToMove[firstFace][i])
        this.$refs[block][0].className = currFaceColours[i]
      }

    },
    performScramble () {
      this.reset()
      if (this.scrambleInput) {
        this.scrambleInput.trim().split(' ').forEach((move) => {
          move = move.trim()
          let moveFace = move.length === 1 ? move : move[0];
          if (this.validMoves.includes(moveFace)) {
            let double = false
            let counterClockwise = false
            if (move.length === 2) {
              counterClockwise = move[1] === '\''
              double = move[1] === '2'
            }
            if (double) this.performMove(moveFace, counterClockwise);
            this.performMove(moveFace, counterClockwise);
          } else {
            this.showSnack('ERROR: The scramble string contained invalid moves!', 'error')
          }
        });
      } else {
        this.showSnack('INFO: No scramble string was passed in!', 'info')
      }

    },
    changeColour (block) {
      const oldKey = Object.keys(this.colours).find(key => this.colours[key].class === this.$refs[block][0].className.substring(6))
      const newKey = Object.keys(this.colours).find(key => this.colours[key].class === this.selectedColour)
      this.colours[oldKey].limit -= 1
      this.colours[newKey].limit += 1
      if (this.colours[newKey].limit > 9) this.showSnack('WARNING: You\'ve added an invalid number of ' + this.selectedColour.replace('Block', '') + ' blocks!', 'warning')
      this.$refs[block][0].className = 'block ' + this.selectedColour

    },
    showSnack (message, colour) {
      this.snackColour = colour
      this.snackMessage.message = message
      this.snackMessage.activate = true
    },
    solve () {
      this.currentState = { alg: '', sol: '', states: { cross: '', f2l: '', oll: '', pll: '' } }
      const map = { white: 'u', orange: 'l', green: 'f', red: 'r', blue: 'b', yellow: 'd' }
      const data = ['', '', '', '', '', '']

      for (const key in this.colours) {
        for (let i = 1; i < 10; i++) {
          const block = String(key) + '-' + String(i)
          data[this.colours[key].idx] += (map[this.$refs[block][0].className.substring(6).replaceAll('Block','').trim()])
        }
      }
      //const x = ["flulfbddr", "rudrruddl", "dbbburrfb", "llffdrubf", "rludlubrf", "lubfbfudl"]
      let solution = ''
      try {
        solution = solver(data.join(''), { partitioned: true })
        // Reformat solution
        const reverseMap = { 'R': 'L', 'L': 'R', 'U': 'D', 'D': 'U', 'd': 'u', 'u': 'd' }
        for (const step in solution) {
          if (step === 'cross' || step === 'f2l') {
            if (step === 'f2l') this.currentState.states[step] += this.currentState.states.cross
            for (let j=0; j < solution[step].length; j++) {
              let str = solution[step][j].replaceAll('prime', "'")

              str = this.convertAlg(str, reverseMap)
              solution[step][j] = str
              this.currentState.sol += str + ' '
              this.currentState.states[step] += this.convertAlg(str, this.moveMask) + ' '
            }
          } else {
            let str = solution[step].replaceAll('prime', "'")
            for (let i=0; i<str.length; i++) {
              str = reverseMap[str[i]] ? str.substring(0, i) + reverseMap[str[i]] + str.substring(i + 1) : str
            }
            solution[step] = [str]
            this.currentState.sol += str + ' '

            if (step === 'oll') {
              this.currentState.states.oll += this.currentState.states.f2l
              this.currentState.states.oll += this.convertAlg(str, this.moveMask)
            } else {
              this.currentState.states.pll += this.currentState.states.oll
              this.currentState.states.pll += ' ' + this.convertAlg(str, this.moveMask)
            }
          }
        }
        this.createAlgString(this.currentState.sol)
        this.instructions = Object.values(solution)
        this.notSolved = false
        this.generatePreview(this.currentState.sol.trim())
        console.log(solution, this.currentState.sol)
      } catch (err) {
        this.showSnack('ERROR: ' + err.message, 'error')
      }
    },
    convertAlg (theString, mapping) {
      for (let i=0; i<theString.length; i++) {
        theString = mapping[theString[i]] ? theString.substring(0, i) + mapping[theString[i]] + theString.substring(i + 1) : theString
      }
      return theString
    },
    createAlgString (moves) {
      // Add to currentState for visualizer
      let split = moves.split(' ')
      for (let k=0; k<split.length-1; k++) {
        if (split[k].includes('\'')) {
          split[k] = split[k].slice(0, split[k].length - 1)
        } else {
          split[k] = split[k] += '\''
        }
      }
      this.currentState.sol = this.convertAlg(split.reverse().join(' '), this.moveMask)
    },
    generatePreview (algorithm) {
      this.currentState.alg = algorithm
      this.$refs.cubePreview.innerHTML = ''
      cubePNG(this.$refs.cubePreview, { cubeSize: 3, algorithm: 'y2 ' + algorithm, width: 500, height: 500 })
    },
    rotateCube () {
      if (this.currentState.alg.slice(this.currentState.alg.length - 2) === 'y2') {
        this.currentState.alg = this.currentState.alg.slice(0, this.currentState.alg.length - 2)
      } else {
        this.currentState.alg += 'y2'
      }
      this.generatePreview(this.currentState.alg)
    },
    scrollTo (section) {
      return { element: '#' + section, offset: -120 }
    },
    reset () {
      for (const key in this.colours) {
        for (let i = 1; i < 10; i++) {
          const block = String(key) + '-' + String(i)
          if (i === 5) {
            this.$refs[block][0].className = 'centerBlock ' + this.colours[key].class
          } else {
            this.$refs[block][0].className = 'block ' + this.colours[key].class
          }
        }
      }
      Object.keys(this.colours).forEach((colour) => {
        this.colours[colour].limit = 9
      })
    }
  }
}
</script>

<style scoped>
  .solverContainer {
    max-width: 1400px;
    padding: 50px;
  }
  .col {
    padding: 3px;
  }
  .hidden {
    display:  none;
  }
  .rubiksInput {
    max-width: 900px;
  }
  .cubePreview {
    min-height: 595px;
  }
  .block, .centerBlock {
    border-radius: 13px;
    border: 3px solid darkslategray;
  }
  .snackMessage {
    margin-top: 85px;
  }
  .stepHeader {
    color: #0275d8;
  }
  .steps {
    font-size: 1.5vw;
  }
  .solveDivider {
    width: 50%;
  }
  .block:hover {
    border: 3px solid cornflowerblue;
  }
  .redBlock {
    background-color: red;
  }
  .orangeBlock {
    background-color: darkorange;
  }
  .whiteBlock {
    background-color: white;
  }
  .yellowBlock {
    background-color: yellow;
  }
  .blueBlock {
    background-color: royalblue;
  }
  .greenBlock {
    background-color: #14D53E;
  }

</style>
