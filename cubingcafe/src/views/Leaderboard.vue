<template>
  <v-container class="leaderContainer">
    <v-snackbar color="error" class="snackMessage" v-model="snackMessage.activate" :timeout="snackMessage.timeout"
                top right transition="slide-y-transition">{{ snackMessage.message }}
    </v-snackbar>
    <v-col>
      <v-row>
        <v-select :items="items" label="Select different leaderboard ..."></v-select>
      </v-row>
      <v-data-table :headers="headers" :items="leaderboard" class="pt-12">
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
    items: ['2 * 2', '3 * 3', '4 * 4', '5 * 5'],
    headers: [
      { text: 'Rank', align: 'start', value: 'rank' },
      { text: 'Username', value: '_id' },
      { text: 'Elo', value: 'elo' },
      { text: 'Wins', value: 'wins' },
      { text: 'Losses', value: 'losses' }
    ],
    leaderboard: []
  }),
  mounted () {
    this.getLeaders()
  },
  methods: {
    async getLeaders () {
      let rank = 1
      const q = { query: 'query usermany { userMany(sort: ELO_DESC) { _id, elo, wins, losses, updatedAt } }', operationName: 'usermany' }
      fetch('/graphql', {
        method: 'post',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      }).then((response) => response.json())
        .then((graphQlRes) => {
          if (graphQlRes.data) {
            for (let entry in graphQlRes.data.userMany) {
              let record = graphQlRes.data.userMany[entry]
              record.rank = rank++
              this.leaderboard.push(record)
            }
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
    padding: 20px 50px 0 50px;
  }

</style>
