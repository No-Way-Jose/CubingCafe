<template>
  <v-container class="creditContainer">
    <v-col>
      <v-row justify="center"><h1>Technologies Used</h1></v-row>
      <v-row class="py-10">
        <v-col v-for="item in tech" :key="item.Title" class="txtAlign">
          <v-btn rounded outlined large v-bind:color="item.colour" @click="viewLink(item.link)">{{ item.Title }}</v-btn>
        </v-col>
      </v-row>
      <v-row justify="center" class="pt-5 pb-10"><h1>Special Thanks To...</h1></v-row>
      <v-row justify="center" class="pb-2"><h2>@watscho</h2></v-row>
      <v-row justify="center"><p>For the express-graphql-mongodb boilerplate which we utilized for our backend implementation</p></v-row>
      <v-row justify="center" class="pt-5 pb-2"><h2>@josephuspaye</h2></v-row>
      <v-row justify="center"><p>For his (60-fps) timer that he made for Vue and vanilla JS</p></v-row>
      <v-row justify="center" class="pt-5 pb-2"><h2>@slammayjammay</h2></v-row>
      <v-row justify="center"><p>For his rubiks cube solver package which we utilized so we could spend more time focusing on web development challenges</p></v-row>
      <v-row></v-row>
    </v-col>
  </v-container>

</template>

<script>
export default {
  name: 'Credits',
  data: () => ({
    tech: [
      { Title: 'Vuetify', link: 'https://vuetifyjs.com/en/', colour: 'primary' },
      { Title: 'Mongoose', link: 'https://mongoosejs.com/', colour: 'warning' },
      { Title: 'Vue', link: 'https://vuejs.org/', colour: 'green' },
      { Title: 'GraphQL', link: 'https://graphql.org/', colour: 'pink' },
      { Title: 'Express', link: 'https://expressjs.com/', colour: 'red' },
    ],
    thanks: []
  }),
  methods : {
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

</style>
