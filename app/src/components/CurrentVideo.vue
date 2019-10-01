<template>
  <v-content>
    <div>
      <ul style="list-style: none;">
        <li>
          <h4>Video atual</h4>
        </li>
        <li>
          <i>Título:</i>
          {{current.videoTitle}}
        </li>
        <li>Preço: {{current.price}}</li>
        <li v-if="current.cupom != ''">Cupom: {{current.cupom}}</li>
      </ul>
    </div>
  </v-content>
</template>

<script>
export default {
  props: ["current"],

  data() {
    return {};
  },
  created() {}
};
</script>

<style>
img {
  width: 230px;
}
</style>