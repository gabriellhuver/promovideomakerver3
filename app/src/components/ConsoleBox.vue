<template>
  <v-content>
    <div>
      <i class="console">{{msg}}</i>
    </div>
  </v-content>
</template>

<script>

export default {
  props: ["msg"],
  data() {
    return {  };
  },
  created() {
    
  }
};
</script>

<style>
.console{
  font-family: "Turret Road", cursive;
}
</style>