<template>
  <v-container class="solverContainer">
    <h1 ref="test">Solver Container</h1>
    <v-row justify="center">
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
    <v-row class="mt-10">
      <v-col cols="8">
        <v-row>
          <h1>Colour Selector</h1>
        </v-row>
        <v-row>
          <v-col cols="12" sm="4" md="2">
            <v-checkbox v-model="selectedColour" label="Red" color="red" value="redBlock"></v-checkbox>
            <v-checkbox v-model="selectedColour" label="Orange" color="orange" value="orangeBlock"></v-checkbox>
          </v-col>
          <v-col cols="12" sm="4" md="2">
            <v-checkbox v-model="selectedColour" label="Blue" color="blue" value="blueBlock"></v-checkbox>
            <v-checkbox v-model="selectedColour" label="Green" color="green" value="greenBlock"></v-checkbox>
          </v-col>
          <v-col cols="12" sm="4" md="2">
            <v-checkbox v-model="selectedColour" label="Yellow" color="yellow" value="yellowBlock"></v-checkbox>
            <v-checkbox v-model="selectedColour" label="White" color="grey" value="whiteBlock"></v-checkbox>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="4">
        <v-row>
          <h1>Options</h1>
        </v-row>
        <v-row>
          <v-btn v-on:click="solve()" color="primary" class="mr-5">Solve!</v-btn>
          <v-btn v-on:click="reset()" color="warning">Reset</v-btn>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-expansion-panels v-model="instructions" multiple>
        <v-expansion-panel v-for="(item,i) in items" :key="i">
          <v-expansion-panel-header>Header {{ item }}</v-expansion-panel-header>
          <v-expansion-panel-content>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>
  </v-container>

</template>

<script>
export default {
  name: 'Solver',
  data: () => ({
    selectedColour: 'redBlock',
    colours: {
      2: { class: 'whiteBlock' },
      5: { class: 'orangeBlock' },
      6: { class: 'greenBlock' },
      7: { class: 'redBlock' },
      8: { class: 'blueBlock' },
      10: { class: 'yellowBlock' }
    },
    instructions: [0, 1, 2, 3, 4],
    items: 5
  }),
  methods: {
    changeColour (block) {
      this.$refs[block][0].className = 'block ' + this.selectedColour
    },
    solve () {
      const map = { whiteBlock: 1, orangeBlock: 2, greenBlock: 3, redBlock: 4, blueBlock: 5, yellowBlock: 6 }
      const data = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
      let counter = 1
      for (const key in this.colours) {
        for (let i = 1; i < 10; i++) {
          const block = String(key) + '-' + String(i)
          data[counter].push(map[this.$refs[block][0].className.substring(6).trim()])
        }
        counter++
      }
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
    padding: 20px 50px 0 50px;
  }
  .col {
    padding: 3px;
  }
  .rubiksInput {
    max-width: 1000px;
  }
  .block, .centerBlock {
    border-radius: 13px;
    border: 3px solid darkslategray;
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
