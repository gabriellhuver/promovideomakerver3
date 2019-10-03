<template>
  <v-content>
    <div>
      <ul class="list">
        <li>
          <h4>
            <b>Video atual</b>
          </h4>
        </li>
        <li>
          <i>Título:</i>
          {{" "+current.videoTitle}}
        </li>
        <li>
          <i>Preço:</i>
          {{" "+current.price}}
        </li>
        <li v-if="current.cupom != ''">
          <i>Cupom:</i>
          {{" "+current.cupom}}
        </li>
      </ul>
    </div>
  </v-content>
</template>

<script>
export default {
  props: ["current"]
};
</script>

<style>
.list {
  list-style: none;
  font-family: "Turret Road", cursive;
}
</style>