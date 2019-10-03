<template>
  <v-content class="home" align-center>
    <h2>Configuraçoes</h2>
    <v-btn class="browserBtn" :loading="loading" @click="open">
      <v-icon>mdi-home</v-icon>Abrir navegador
    </v-btn>
    <div class="divSlider">
      <v-slider
        @change="handleDelay"
        class="slider"
        min="30"
        max="666"
        append-icon="mdi-alarm"
        v-model="config.delay"
        label="Delay"
      ></v-slider>
      <div class="seconds">{{config.delay}} Segundos</div>
      <ul style="list-style: none;">
        <li>
          <i>Código de afiliado:</i>
          <b>{{" " +config.codigo}}</b>
        </li>
        <li>
          <i>Grupo do telegram:</i>
          <b>{{" "+ config.telegramGroup}}</b>
        </li>
      </ul>
    </div>
  </v-content>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      config: {}
    };
  },
  methods: {
    open() {
      this.loading = true;
      this.sockets.subscribe("open", () => {
        this.loading = false;
      });
      this.$socket.emit("open");
    },
    handleDelay(event) {
      console.log(event);
      this.$socket.emit("delay", this.config.delay);
    }
  },
  created() {
    this.sockets.subscribe("getConfig", data => {
      this.config = data;
      console.log(data);
    });
    this.$socket.emit("getConfig");
  }
};
</script>

<style>
.slider {
  max-width: 280px;
  margin: 0 auto;
  margin-top: 32px;
}
.browserBtn {
  margin-top: 32px;
}
.seconds{
  margin-top: -32px;
  margin-bottom: 32px;
}
</style>