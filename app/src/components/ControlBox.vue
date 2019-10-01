<template>
  <v-content text-center justify-center>
    <v-content row>
      <v-btn
        class="controlBtn"
        v-if="!this.$store.state.status && !renewLoading"
        :loading="loading"
        @click="start"
        color="success"
      >
        <v-icon>mdi-arrow-right-bold</v-icon>Start
      </v-btn>
      <v-btn class="controlBtn" v-if="!renewLoading" dark color="red" :loading="loading" @click="stop">
        <v-icon>mdi-close</v-icon>KILL
      </v-btn>
    </v-content>
    <v-btn v-if="!loading" :loading="renewLoading" @click="renew">
      <v-icon>mdi-sync</v-icon>Atualizar lista
    </v-btn>
  </v-content>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      renewLoading: false
    };
  },
  methods: {
    renew() {
      this.renewLoading = true;
      this.sockets.subscribe("renew", () => {
        this.renewLoading = false;
      });
      this.$socket.emit("renew");
    },
    start() {
      this.loading = true;
      setTimeout(() => {
        this.$socket.emit("startBot", true);
        this.loading = false;
      }, 1000);
    },
    stop() {
      this.$socket.emit("message", "Parando processo!");
      this.loading = true;
      setTimeout(() => {
        this.$socket.emit("stopBot", true);
        this.loading = false;
        this.$socket.emit("message", "Processo parado com sucesso!");
      }, 2500);
    }
  },
  created() {}
};
</script>


<style>
.controlBtn {
  margin: 12px;
}
</style>