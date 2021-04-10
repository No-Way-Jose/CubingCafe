<template>
  <v-container class="creditContainer">
    <v-col>
      <v-row justify="center"><h1>Technologies Used</h1></v-row>
      <v-row class="py-10">
        <v-col v-for="item in tech" :key="item.title" class="txtAlign">
          <v-btn rounded outlined large v-bind:color="item.colour" @click="viewLink(item.link)">{{ item.title }}</v-btn>
        </v-col>
      </v-row>
      <v-row justify="center" class="py-5"><h1>Special Thanks To...</h1></v-row>
      <v-col v-for="special in thanks" :key="special.title" class="py-5">
        <v-row justify="center" class="py-2"><h2 v-on:click="viewLink(special.link)" class="thanksTxt">{{ special.title }}</h2></v-row>
        <v-row justify="center"><p>{{ special.blurb }}</p></v-row>
      </v-col>
    </v-col>
  </v-container>

</template>

<script>
export default {
  name: 'Credits',
  data: () => ({
    tech: [
      { title: 'Vuetify', link: 'https://vuetifyjs.com/en/', colour: 'primary' },
      { title: 'Mongoose', link: 'https://mongoosejs.com/', colour: 'warning' },
      { title: 'Vue', link: 'https://vuejs.org/', colour: 'green' },
      { title: 'GraphQL', link: 'https://graphql.org/', colour: 'pink' },
      { title: 'Express', link: 'https://expressjs.com/', colour: 'red' }
    ],
    thanks: [
      {
        title: '@watscho',
        blurb: 'For the express-graphql-mongodb boilerplate which we utilized for our backend implementation',
        link: 'https://github.com/watscho/express-graphql-mongodb-boilerplate'
      },
      {
        title: '@slammayjammay',
        blurb: 'For his rubiks cube solver package which we utilized so we could spend more time focusing on web development challenges',
        link: 'https://www.npmjs.com/package/rubiks-cube-solver'
      },
      {
        title: '@josephuspaye',
        blurb: 'For his (60-fps) timer that he made for Vue and vanilla JS',
        link: 'https://www.npmjs.com/package/@josephuspaye/timer'
      }
    ]
  }),
  methods: {
    viewLink (link) {
      window.open(link)
    }
  }
}
</script>

<style scoped>
  .creditContainer {
    max-width: 1400px;
    padding: 50px;
  }
  .txtAlign {
    text-align: center;
  }
  .thanksTxt {
    color: #1791e8;
    cursor: pointer;
  }

</style>
