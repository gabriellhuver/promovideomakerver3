<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Promo video maker</span>
        <span class="font-weight-light">VER4</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text icon href="/" color="black">
        <v-icon dark>mdi-home</v-icon>
      </v-btn>
      <v-btn text icon href="/#/config" color="black">
        <v-icon dark>mdi-settings</v-icon>
      </v-btn>
    </v-app-bar>
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: "App",
  components: {},
  data: () => ({
    //
  })
};
</script>
<style >
v-app{
  font-family: 'Turret Road', cursive;
}
</style>