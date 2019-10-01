<template>
  <v-content class="home">
    <h1>Configuraçoes</h1>
    <v-btn :loading="loading" @click="open">
      <v-icon>mdi-home</v-icon>Abrir navegador
    </v-btn>
  </v-content>
</template>

<script>
export default {
  data() {
    return {
      loading: false
    };
  },
  methods: {
    open() {
      this.loading = true;
      this.sockets.subscribe("open", () => {
        this.loading = false;
      });
      this.$socket.emit("open");
    }
  }
};
</script>

<style>
</style>