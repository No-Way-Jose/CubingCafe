<template>
  <v-container class="profileContainer">
    <v-snackbar v-bind:color="snackMessage.colour" class="snackMessage" v-model="snackMessage.activate" :timeout="snackMessage.timeout"
                top right transition="slide-y-transition">{{ snackMessage.message }}
    </v-snackbar>
    <v-row class="pt-10 pb-12">
      <h1>Quick Stats</h1>
    </v-row>
    <v-row class="pb-12">
      <v-col>
        <v-row justify="center"><v-icon large class="pr-2" color="primary">mdi-star</v-icon><h2>{{ userStats.fav }}</h2></v-row>
        <v-row justify="center" class="pt-4">Favourite Cube</v-row>
      </v-col>
      <v-divider vertical class="my-3"/>
      <v-col>
        <v-row justify="center"><v-icon large class="pr-2" color="warning">mdi-run-fast</v-icon><h2>{{ msToTime(userStats.best) }}</h2></v-row>
        <v-row justify="center" class="pt-4">Fastest Solve</v-row>
      </v-col>
      <v-divider vertical class="my-3"/>
      <v-col>
        <v-row justify="center"><v-icon large class="pr-2" color="pink">mdi-sleep</v-icon><h2>{{ msToTime(userStats.worst) }}</h2></v-row>
        <v-row justify="center" class="pt-4">Slowest Solve</v-row>
      </v-col>
      <v-divider vertical class="my-3"/>
      <v-col>
        <v-row justify="center"><v-icon large class="pr-2" color="red">mdi-timer-outline</v-icon><h2>{{ msToTime(userStats.avg) }}</h2></v-row>
        <v-row justify="center" class="pt-4">Overall Avg Time</v-row>
      </v-col>
    </v-row>
    <v-row class="pt-12">
      <v-col cols="7">
        <v-row>
          <h1>Solve History</h1>
          <v-menu transition="slide-y-transition" :offset-y="true" bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" rounded elevation="0" class="ml-3 mt-2" color="transparent">
                <v-icon class="mr-3" color="#1791e8">mdi-cube-outline</v-icon>
                {{ selectedSize.title }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-for="item in size" :key="item.val" @click="cubeSizeFilter(item)">
                <v-list-item-title class="centreTxt">{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-row>
      </v-col>
      <v-col cols="5">
        <h1>Cube Demographic</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="7">
        <v-data-table :headers="headers" :items="solves.history" :loading="solves.loading"
                      @update:options="updateHistory" :server-items-length="solves.max">
        </v-data-table>
      </v-col>
      <v-col cols="5">
        <GChart class="charts" v-bind:type="selectedChart.type" v-bind:data="selectedChart.data" v-bind:options="selectedChart.options"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Profile',
  data: () => ({
    snackMessage: { activate: false, message: null, colour: 'error', timeout: 5000 },
    selectedChart: { type: 'PieChart', data: [['Cube Frequency', '']], options: { pieHole: 0.4 } },
    headers: [
      { text: '#', value: 'id', sortable: false },
      { text: 'Time', value: 'time' },
      { text: 'Cube', value: 'size' },
      { text: 'Date', value: 'updatedAt' }
    ],
    solves: { max: 0, loading: true, order: 'UPDATEDAT_DESC', history: [] },
    userStats: { fav: '3 x 3', avg: 0, best: 0, worst: 0 },
    selectedSize: { title: 'All sizes', val: '' },
    size: [{ title: 'All sizes', val: '' }, { title: '2 x 2', val: '_2x2' }, { title: '3 x 3', val: '_3x3' }, { title: '4 x 4', val: '_4x4' },
      { title: '5 x 5', val: '_5x5' }, { title: '6 x 6', val: '_6x6' }, { title: '7 x 7', val: '_7x7' }],
    sortAndPageInfo: {}
  }),
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.getUserStats()
    })
  },
  methods: {
    cubeSizeFilter (sizeObj) {
      this.selectedSize = sizeObj
      this.getSolveCount()
    },
    updateHistory (e) {
      this.solves.loading = true
      let order = false
      if (e.sortBy.length > 0) {
        const dir = (e.sortDesc[0]) ? '_DESC' : '_ASC'
        order = e.sortBy[0].toUpperCase() + dir
      }
      if (order && (order !== this.solves.order)) this.solves.order = order
      this.sortAndPageInfo = e
      this.getSolveCount()
    },
    async getSolveCount () {
      const filter = {}
      if (this.selectedSize.val) filter.size = this.selectedSize.val
      const q = {
        query: 'query solves ($filter: FilterCountSolveInput) { solveCount (filter: $filter) }',
        operationName: 'solves',
        variables: { filter }
      }
      fetch('/graphql', {
        method: 'post',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      }).then((response) => response.json())
        .then((graphQlRes) => {
          if (graphQlRes.data) {
            this.solves.max = graphQlRes.data.solveCount
            this.getSolveHistory(this.sortAndPageInfo.page, this.sortAndPageInfo.itemsPerPage, filter)
          } else {
            this.showSnack(graphQlRes.errors[0].message)
          }
        })
        .catch((err) => console.error(err))
    },
    async getSolveHistory (page, limit, filter) {
      let id = 1 + ((page - 1) * limit)
      const q = {
        query: 'query solvemany ($filter: FilterFindManySolveInput, $skip: Int, $limit: Int, $sort: SortFindManySolveInput) { ' +
          'solveMany(sort: $sort, limit: $limit, skip: $skip, filter: $filter) { time, size, updatedAt } }',
        variables: { sort: this.solves.order, skip: ((page - 1) * limit), limit: limit, filter },
        operationName: 'solvemany'
      }
      fetch('/graphql', {
        method: 'post',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      }).then((response) => response.json())
        .then((graphQlRes) => {
          if (graphQlRes.data) {
            this.solves.history = []
            for (const entry in graphQlRes.data.solveMany) {
              const record = graphQlRes.data.solveMany[entry]
              record.id = id++
              record.time = this.msToTime(record.time)
              record.updatedAt = record.updatedAt.substring(0, 10)
              record.size = record.size.substring(1, 4)
              this.solves.history.push(record)
            }
            this.solves.loading = false
          } else {
            this.showSnack(graphQlRes.errors[0].message, 'error')
          }
        })
        .catch((err) => console.error(err))
    },
    async getUserStats () {
      const q = { query: 'query getstats { getStats { _id, slowest, fastest, avg, count } }', operationName: 'getstats' }
      fetch('/graphql', {
        method: 'post',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      }).then((response) => response.json())
        .then((graphQlRes) => {
          if (graphQlRes.data) {
            const data = graphQlRes.data.getStats
            this.userStats.fav = data[0]._id.substring(1)
            this.userStats.worst = data[0].slowest
            this.userStats.best = data[0].fastest
            this.userStats.avg = data[0].avg

            for (const entry in data) {
              const record = []
              record.push(data[entry]._id.substring(1))
              record.push(data[entry].count)
              this.selectedChart.data.push(record)
            }
          } else {
            this.showSnack(graphQlRes.errors[0].message, 'error')
          }
        })
        .catch((err) => console.error(err))
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
    min-height: 40vh;
  }
  .snackMessage {
    margin-top: 85px;
  }

</style>
