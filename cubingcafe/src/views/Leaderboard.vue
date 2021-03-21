<template>
  <v-container class="leaderContainer">
    <v-col>
      <v-row>
        <v-select
          :items="items"
          label="Select different leaderboard ..."
        ></v-select>
      </v-row>
      <v-data-table :headers="headers" :items="desserts" class="pt-12">
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
    items: ['2 * 2', '3 * 3', '4 * 4', '5 * 5'],
    headers: [
      { text: 'Rank', align: 'start', value: 'rank' },
      { text: 'Username', value: 'username' },
      { text: 'Best Time', value: 'best' },
      { text: '# of Solves', value: 'solves' }
    ],
    desserts: [
      { rank: 1, username: 'lynjust2', solves: 6.0, best: 24 },
      { rank: 2, username: 'asdasdasd', solves: 6.0, best: 24 },
      { rank: 3, username: 'sdfrjdd', solves: 6.0, best: 24 },
      { rank: 4, username: 'ddfg2344', solves: 6.0, best: 24 },
      { rank: 5, username: 'fdhjy33', solves: 6.0, best: 24 },
      { rank: 6, username: 'dfgdfg33', solves: 6.0, best: 24 },
      { rank: 7, username: 'efg111', solves: 6.0, best: 24 },
      { rank: 8, username: 'dfgdfgfd1123', solves: 6.0, best: 24 }
    ]
  })
}
</script>

<style scoped>
  .leaderContainer {
    max-width: 1400px;
    padding: 20px 50px 0 50px;
  }

</style>
