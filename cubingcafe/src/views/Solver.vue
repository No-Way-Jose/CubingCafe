<template>
  <v-container class="solverContainer">
    <!-- Snackbar template -->
    <v-snackbar class="snackMessage" color="red" v-model="snackMessage.activate" :timeout="snackMessage.timeout" top right transition="slide-y-transition">
      {{ snackMessage.message }}
    </v-snackbar>

    <v-row justify="center" class="pb-5">
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
    <v-row class="mt-12">
      <v-col cols="8">
        <v-row>
          <h1>Colour Selector</h1>
        </v-row>
        <v-row>
          <v-col v-for="option in options" :key="option.label" cols="12" sm="4" md="2">
            <v-checkbox v-model="selectedColour" v-bind:label="option.label" v-bind:color="option.colour" v-bind:value="option.value"></v-checkbox>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="4" class="pl-6">
        <v-row>
          <h1>Options</h1>
        </v-row>
        <v-row class="pt-5 pl-2">
          <v-btn @click="solve()" color="primary" class="mr-5">Solve!</v-btn>
          <v-btn @click="reset()" color="warning">Reset</v-btn>
        </v-row>
      </v-col>
    </v-row>
    <v-row><h2>Rubiks Cube Notation</h2></v-row>
    <v-row>
      <v-row class="py-4 pl-6">
        <v-col>
          <v-row class="py-4"><h3>Cube Faces</h3></v-row>
          <v-row>
            <v-col>• F: The front face (Green)</v-col>
            <v-col>• B: The back face (Blue)</v-col>
            <v-col>• R: The right face (Red)</v-col>
            <v-col>• L: The left face (Orange)</v-col>
            <v-col>• U: The top face (Yellow)</v-col>
            <v-col>• D: The bottom face (White)</v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row class="pt-4 pl-6">
        <v-col class="pr-3">
          <v-row class="py-4"><h3>Cube Turns</h3></v-row>
          <p>• X: A 90-degree clockwise turn of the X face</p>
          <p>• X': A 90-degree counterclockwise turn of the X face</p>
          <p>• X2: A 180-degree turn (either direction) of the X face</p>
        </v-col>
        <v-col class="pr-3">
          <v-row class="py-4"><h3>Slice Turns</h3></v-row>
          <p>• M: a move of the Middle layer (Between R and L), in the same direction as an L turn</p>
          <p>• E: a move of the Equatorial layer (Between U and D), in the same direction as a D turn</p>
          <p>• S: a move of the Standing layer (between F and B), in the same direction as an F turn</p>
        </v-col>
        <v-col class="pr-3">
          <v-row class="py-4"><h3>Combination Turns</h3></v-row>
          <p>• r: a move of the Right & Middle layer</p>
          <p>• b: a move of the Back & Standing layer</p>
          <p>• Similar logic applies to the other possible combination / lowercase notations</p>
        </v-col>
      </v-row>
    </v-row>
    <v-row class="cubePreview">
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

    <v-row class="py-6"><h1>Solution</h1></v-row>
    <v-row ref="cubeImg"></v-row>
    <v-row>
      <v-col cols="8">
        <v-expansion-panels>
          <v-expansion-panel v-for="(steps, idx) in instructions" :key="idx">
            <v-expansion-panel-header><h3>{{ headers[idx].step }}</h3></v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row>
                <v-col cols="10">
                  <p v-for="(step, ix) in steps" :key="ix">{{ step }}</p>
                </v-col>
                <v-col cols="2" align-self="center"><v-btn color="primary">View</v-btn></v-col>
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
    colours: {
      6: { class: 'greenBlock', idx: 0 },
      7: { class: 'redBlock', idx: 1 },
      2: { class: 'whiteBlock', idx: 2 },
      10: { class: 'yellowBlock', idx: 3 },
      5: { class: 'orangeBlock', idx: 4 },
      8: { class: 'blueBlock', idx: 5 },
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
      { step: 'C: Cross', moves: ''},
      { step: 'F: F2L (First 2 Layers)', moves: ''},
      { step: 'O: OLL (Orient Last Layer)', moves: ''},
      { step: 'P: PLL (Permute Last Layer)', moves: ''}
      ],
    instructions: [],
    currentState: 'x2 R\' U L B U F L2 D R D U\' R',
    snackMessage: { activate: false, message: null, timeout: 3000 }
  }),
  methods: {
    changeColour (block) {
      this.$refs[block][0].className = 'block ' + this.selectedColour
    },
    showSnack (message) {
      this.snackMessage.message = message
      this.snackMessage.activate = true
    },
    solve () {
      const map = { white: 'u', orange: 'l', green: 'f', red: 'r', blue: 'b', yellow: 'd' }
      const data = ['', '', '', '', '', '']

      console.log(Object.keys(this.colours))
      for (const key in this.colours) {
        for (let i = 1; i < 10; i++) {
          const block = String(key) + '-' + String(i)
          data[this.colours[key].idx] += (map[this.$refs[block][0].className.substring(6).replaceAll('Block','').trim()])
        }
      }
      const x = ["flulfbddr", "rudrruddl", "dbbburrfb", "llffdrubf", "rludlubrf", "lubfbfudl"]
      console.log(data.join(''))

      let solution = ''
      try {
        solution = solver(x.join(''), { partitioned: true })
      }
      catch (err) {
        this.showSnack(err.message)
        console.log('ERROR', err.message)
      }

      // Reformat solution
      const reverseMap = { 'R': 'L', 'L': 'R', 'U': 'D', 'D': 'U', 'd': 'u', 'u': 'd' }
      for (const step in solution) {
        if (step === 'cross' || step === 'f2l') {
          for (let j=0; j < solution[step].length; j++) {
            let str = solution[step][j].replaceAll('prime', "'")
            console.log(str)
            for (let i=0; i<str.length; i++) {
              str = reverseMap[str[i]] ? str.substring(0, i) + reverseMap[str[i]] + str.substring(i + 1) : str
            }
            solution[step][j] = str
          }
        } else {
          let str = solution[step].replaceAll('prime', "'")
          for (let i=0; i<str.length; i++) {
            str = reverseMap[str[i]] ? str.substring(0, i) + reverseMap[str[i]] + str.substring(i + 1) : str
          }
          solution[step] = str
        }
      }

      this.instructions = Object.values(solution)
      console.log(this.instructions)
      this.generatePreview()
      //cubePNG(this.$refs.cubePreview, { cubeSize: 3, algorithm: this.currentState, width: 500, height: 500 })
      //cubePNG(this.$refs.cubePreview, { cubeSize: 3, algorithm: "x2 R' U L B U F L2 D R D U' R y2", width: 500, height: 500 })

    },
    generatePreview () {
      this.$refs.cubePreview.innerHTML = ''
      cubePNG(this.$refs.cubePreview, { cubeSize: 3, algorithm: this.currentState, width: 500, height: 500 })
    },
    rotateCube () {
      if (this.currentState.slice(this.currentState.length - 2) === 'y2') {
        this.currentState = this.currentState.slice(0, this.currentState.length - 2)
      } else {
        this.currentState += 'y2'
      }
      this.generatePreview()

    },
    reset () {
      for (const key in this.colours) {
        for (let i = 1; i < 10; i++) {
          const block = String(key) + '-' + String(i)
          if (block === '6-5') {
            this.$refs[block][0].className = 'centerBlock ' + this.colours[key].class
          } else {
            this.$refs[block][0].className = 'block ' + this.colours[key].class
          }
        }
      }
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
    background-color: springgreen;
  }

</style>
