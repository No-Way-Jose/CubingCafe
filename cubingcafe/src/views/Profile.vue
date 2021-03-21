<template>
  <v-container class="profileContainer">
    <v-row class="pt-10 pb-12">
      <h2>Quick Stats</h2>
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
      <h2>History & Graphs</h2>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-data-table :headers="headers" :items="history">
          <template v-slot:header.name="{ header }">{{ header.text.toUpperCase() }}</template>
        </v-data-table>

      </v-col>
      <v-col cols="6">
        <v-row class="pa-4">
          <v-btn elevation="0" v-on:click="chartSeek(0)" color="transparent"><v-icon>mdi-skip-previous</v-icon></v-btn>
          <h2 class="px-4">{{ selectedChart.chart.options.title }}</h2>
          <v-btn elevation="0" v-on:click="chartSeek(1)" color="transparent"><v-icon>mdi-skip-next</v-icon></v-btn>
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
    selectedChart: { idx: 0, chart: { type: 'PieChart', data: [['Cube Frequency', ''], ['3 * 3', 60], ['4 * 4', 40]], options: { pieHole: 0.4, title: 'Cube Frequency' } } },
    chartData: [
      { type: 'PieChart', data: [['Cube Frequency', ''], ['3 * 3', 60], ['4 * 4', 40]], options: { pieHole: 0.4, title: 'Cube Frequency' } },
      { type: 'ColumnChart', data: [['', ''], ['New York City, NY', 8175000], ['Los Angeles, CA', 3792000], ['Chicago, IL', 2695000], ['Houston, TX', 2099000]], options: { title: 'IDK' } },
      { type: 'PieChart', data: [['Cube Frequency', ''], ['3 * 3', 60], ['4 * 4', 40]], options: { pieHole: 0.4, title: 'Cube Frequency' } }
    ],
    headers: [
      { text: '#', value: 'id' },
      { text: 'Time', value: 'time' },
      { text: 'Cube', value: 'cube' },
      { text: 'Date', value: 'date' }
    ],
    history: [
      { id: 1, time: '1.23', cube: '3 * 3', date: 'Jan' },
      { id: 2, time: '1.233', cube: '3 * 3', date: 'Jan' },
      { id: 3, time: '1.243', cube: '2 * 2', date: 'Feb' },
      { id: 4, time: '1.253', cube: '2 * 2', date: 'Jan' },
      { id: 5, time: '1.273', cube: '3 * 3', date: 'Mar' },
      { id: 6, time: '1.263', cube: '3 * 3', date: 'Jan' },
      { id: 7, time: '1.233', cube: '2 * 2', date: 'Jan' },
      { id: 8, time: '1.23', cube: '3 * 3', date: 'Jun' }
    ]
  }),
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
    }
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

</style>
