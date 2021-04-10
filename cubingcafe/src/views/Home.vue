<template>
  <v-container class="homeContainer">
    <v-row>
      <v-col cols="6">
        <h1 class="homeText">Cubing Cafe</h1>
      </v-col>
      <v-col class="logoCol" cols="6">
        <v-row>
          <v-col v-for="n in 9" :key="n" class="d-flex child-flex" cols="4">
            <div v-aspect-ratio="'1:1'" v-bind:class="colours[n]"></div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  name: 'Home',
  data: () => ({
    colours: ['red', 'orange', 'blue', 'white', 'white', 'yellow', 'green', 'red', 'blue', 'orange']
  })
}
</script>

<style>
  .homeContainer {
    min-height: 80vh;
    padding: 30px 20px 20px 20px;
  }
  .homeText {
    font-size: 8vw;
    padding-top: 17%;
    z-index: 2;
    position: absolute;
  }
  .logoCol {
    max-height: 95vh;
    padding-top: 8.5%;
    z-index: 1;
    text-align: center;
  }

</style>
