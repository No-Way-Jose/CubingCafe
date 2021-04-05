<template>
  <v-container class="profileContainer">
    <v-snackbar v-bind:color="snackMessage.colour" class="snackMessage" v-model="snackMessage.activate" :timeout="snackMessage.timeout"
                top right transition="slide-y-transition">{{ snackMessage.message }}
    </v-snackbar>
    <v-row class="pt-10 pb-12">
      <h1>Quick Stats</h1>
    </v-row>
    <v-row>
      <v-col>
        <v-row justify="center"><v-icon large class="pr-2" color="warning">mdi-run-fast</v-icon><h2>4 Hours</h2></v-row>
        <v-row justify="center" class="pt-4">Fastest Solve</v-row>
      </v-col>
      <v-divider vertical class="my-3"/>
      <v-col>
        <v-row justify="center"><v-icon large class="pr-2" color="pink">mdi-sleep</v-icon><h2>50 Hours</h2></v-row>
        <v-row justify="center" class="pt-4">Slowest Solve</v-row>
      </v-col>
      <v-divider vertical class="my-3"/>
      <v-col>
        <v-row justify="center"><v-icon large class="pr-2" color="primary">mdi-star</v-icon><h2>3 * 3</h2></v-row>
        <v-row justify="center" class="pt-4">Favourite Cube</v-row>
      </v-col>
      <v-divider vertical class="my-3"/>
      <v-col>
        <v-row justify="center"><v-icon large class="pr-2" color="red">mdi-timer-outline</v-icon><h2>100s</h2></v-row>
        <v-row justify="center" class="pt-4">Overall Avg Time</v-row>
      </v-col>
    </v-row>
    <v-row class="py-12">
      <h1>History & Graphs</h1>
      <v-btn small outlined rounded color="primary" class="ml-6 mt-3" @click="getUserData">Load More</v-btn>
    </v-row>
    <v-row>
      <v-col cols="7">
        <v-data-table :headers="headers" :items="history">
          <template v-slot:header.name="{ header }">{{ header.text.toUpperCase() }}</template>
        </v-data-table>
      </v-col>
      <v-col cols="5">
        <v-row class="pa-4">
          <v-btn elevation="0" @click="chartSeek(0)" color="transparent"><v-icon>mdi-skip-previous</v-icon></v-btn>
          <h2 class="px-4">{{ selectedChart.chart.options.title }}</h2>
          <v-btn elevation="0" @click="chartSeek(1)" color="transparent"><v-icon>mdi-skip-next</v-icon></v-btn>
        </v-row>
        <v-row>
          <GChart class="charts" v-bind:type="selectedChart.chart.type" v-bind:data="selectedChart.chart.data" v-bind:options="selectedChart.chart.options"/>
        </v-row>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
export default {
  name: 'Profile',
  data: () => ({
    snackMessage: { activate: false, message: null, colour: 'error', timeout: 5000 },
    selectedChart: { idx: 0, chart: { type: 'PieChart', data: [['Cube Frequency', ''], ['3 * 3', 60], ['4 * 4', 40]], options: { pieHole: 0.4, title: 'Cube Frequency' } } },
    chartData: [
      { type: 'PieChart', data: [['Cube Frequency', ''], ['3 * 3', 60], ['4 * 4', 40]], options: { pieHole: 0.4, title: 'Cube Frequency' } },
      { type: 'ColumnChart', data: [['', ''], ['New York City, NY', 8175000], ['Los Angeles, CA', 3792000], ['Chicago, IL', 2695000], ['Houston, TX', 2099000]], options: { title: 'IDK' } },
      { type: 'PieChart', data: [['Cube Frequency', ''], ['3 * 3', 60], ['4 * 4', 40]], options: { pieHole: 0.4, title: 'Cube Frequency' } }
    ],
    headers: [
      { text: '#', value: 'id' },
      { text: 'Time', value: 'time' },
      { text: 'Cube', value: 'size' },
      { text: 'Session', value: 'session' },
      { text: 'Date', value: 'updatedAt' }
    ],
    history: [],
    pagination: { limit: 20, count: 0 }
  }),
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.getUserData()
    })
  },
  methods: {
    chartSeek (direction) {
      let nextChart = 0
      const numOfCharts = this.chartData.length
      if (direction) {
        nextChart = (((this.selectedChart.idx + 1) % numOfCharts) + numOfCharts) % numOfCharts
      } else {
        nextChart = (((this.selectedChart.idx - 1) % numOfCharts) + numOfCharts) % numOfCharts
      }
      this.selectedChart.idx = nextChart
      this.selectedChart.chart = this.chartData[nextChart]
    },
    async getUserData () {
      let id = 1
      const q = { query: 'query solvemany ($skip: Int) { solveMany(sort:UPDATEDAT_DESC, limit: 20, skip: $skip) { time, size, session, updatedAt } }',
        variables: { skip: this.pagination.count * this.pagination.limit },
        operationName: 'solvemany' }
      fetch('/graphql', {
        method: 'post',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      }).then((response) => response.json())
        .then((graphQlRes) => {
          if (graphQlRes.data) {
            if (graphQlRes.data.solveMany.length > 0) {
              for (let entry in graphQlRes.data.solveMany) {
                let record = graphQlRes.data.solveMany[entry]
                record.id = id++
                record.time = this.msToTime(record.time)
                record.updatedAt = record.updatedAt.substring(0,10)
                record.size = record.size.substring(1, 4)
                this.history.push(record)
              }
            } else {
              this.showSnack('INFO: No more data to load!', 'primary')
            }
            this.pagination.count += 1
          } else {
            this.showSnack(graphQlRes.errors[0].message, 'error')
          }
        })
        .catch((err) => console.log(err))
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
    showSnack (message, colour) {
      this.snackMessage.colour = colour
      this.snackMessage.message = message
      this.snackMessage.activate = true
    },
  }
}
</script>

<style scoped>
  .profileContainer {
    max-width: 1400px;
    padding: 20px 50px 0 50px;
  }
  .charts{
    width: 100%;
    min-height: 30vh;
  }
  .snackMessage {
    margin-top: 85px;
  }

</style>
