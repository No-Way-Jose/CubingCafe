<template>
  <v-container class="leaderContainer">
    <v-snackbar color="error" class="snackMessage" v-model="snackMessage.activate" :timeout="snackMessage.timeout"
                top right transition="slide-y-transition">{{ snackMessage.message }}
    </v-snackbar>
    <v-col>
      <v-row><h1>Global Rankings</h1><v-icon x-large color="warning" class="ml-4">mdi-trophy</v-icon></v-row>
      <v-data-table :headers="headers" :items="leaders.leaderboard" class="pt-12"
                    @update:options="updateBoard" :server-items-length="leaders.max" :loading="leaders.loading">
        <template v-slot:header.name="{ header }">
          {{ header.text.toUpperCase() }}
        </template>
      </v-data-table>
    </v-col>
  </v-container>
</template>

<script>
export default {
  name: 'Leaderboard',
  data: () => ({
    snackMessage: { activate: false, message: null, timeout: 5000 },
    leaders: { max: 0, loading: true, order: 'ELO_DESC', leaderboard: [] },
    headers: [
      { text: 'Rank', align: 'start', value: 'rank', sortable: false },
      { text: 'Username', value: '_id', sortable: false },
      { text: 'Elo', value: 'elo' },
      { text: 'Wins', value: 'wins' },
      { text: 'Losses', value: 'losses' }
    ]
  }),
  methods: {
    updateBoard (e) {
      this.leaders.loading = true
      let order = false
      if (e.sortBy.length > 0) {
        const dir = (e.sortDesc[0]) ? '_DESC' : '_ASC'
        order = e.sortBy[0].toUpperCase() + dir
      }
      if (order && (order !== this.leaders.order)) this.leaders.order = order
      this.getUserCount(e)
    },
    async getUserCount (info) {
      const q = { query: 'query users { userCount { max} }', operationName: 'users' }
      fetch('/graphql', {
        method: 'post',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      }).then((response) => response.json())
        .then((graphQlRes) => {
          if (graphQlRes.data) {
            this.leaders.max = graphQlRes.data.userCount.max
            this.getLeaders(info.page, info.itemsPerPage)
          } else {
            this.showSnack(graphQlRes.errors[0].message)
          }
        })
        .catch((err) => console.log(err))
    },
    async getLeaders (page, limit) {
      let rank = 1 + ((page - 1) * limit)
      const q = {
        query: 'query usermany ($skip: Int, $limit: Int, $sort: SortFindManyUserInput) { ' +
          'userMany(sort: $sort, limit: $limit, skip: $skip) { _id, elo, wins, losses, updatedAt } }',
        variables: { sort: this.leaders.order, skip: ((page - 1) * limit), limit: limit },
        operationName: 'usermany'
      }
      fetch('/graphql', {
        method: 'post',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      }).then((response) => response.json())
        .then((graphQlRes) => {
          if (graphQlRes.data) {
            this.leaders.leaderboard = []
            for (const entry in graphQlRes.data.userMany) {
              const record = graphQlRes.data.userMany[entry]
              record.rank = rank++
              this.leaders.leaderboard.push(record)
            }
            this.leaders.loading = false
          } else {
            this.showSnack(graphQlRes.errors[0].message)
          }
        })
        .catch((err) => console.log(err))
    },
    showSnack (message) {
      this.snackMessage.message = message
      this.snackMessage.activate = true
    }
  }
}
</script>

<style scoped>
  .leaderContainer {
    max-width: 1400px;
    padding: 50px;
  }
  .snackMessage {
    margin-top: 85px;
  }

</style>
