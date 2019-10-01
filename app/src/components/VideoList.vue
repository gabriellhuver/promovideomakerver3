<template>
  <v-content>
    <div class="listBox">
      <v-data-table :headers="headers" :items="items" :items-per-page="5" class="elevation-1">
        <template v-slot:item.seller="{ item }">
          <b class="empix">{{item.seller}}</b>
        </template>
        <template v-slot:item.name="{ item }">
          <i class="empix">{{item.name}}</i>
        </template>
        <template v-slot:item.price="{ item }">
          <b class="empix">{{item.price}}</b>
        </template>

        <template v-slot:item.percent="{ item }">
          <v-btn dark :color="color(item)">
            {{item.percent}}
            <v-icon>{{icon(item)}}</v-icon>
          </v-btn>
        </template>
        <template v-slot:item.url="{ item }">
          <a style="text-decoration:none;" :href="item.url" target="_blank">
            <v-icon>mdi-open-in-new</v-icon>
          </a>
        </template>
      </v-data-table>
    </div>
  </v-content>
</template>

<script>
export default {
  data() {
    return {
      headers: [
        {
          text: "Vendedor",
          align: "center",
          sortable: false,
          value: "seller"
        },
        {
          text: "Nome",
          align: "left",
          sortable: false,
          value: "name"
        },
        {
          text: "Preço",
          align: "left",
          sortable: true,
          value: "price"
        },
        {
          text: "Temperatura",
          align: "center",
          sortable: true,
          value: "percent"
        },
        {
          text: "Cupom",
          align: "left",
          sortable: true,
          value: "cupom"
        },
        {
          text: "Url",
          align: "left",
          sortable: true,
          value: "url"
        }
      ],
      items: [],
      temperatureColor: "red"
    };
  },
  created() {
    this.sockets.subscribe("videoList", data => {
      this.items = data;
    });
    this.$socket.emit("videoList");
    setInterval(() => {
      this.$socket.emit("videoList");
    }, 2500);
  },
  methods: {
    icon(item) {
      return item.percent >= 350 ? "mdi-fire" : "mdi-temperature-celsius";
    },
    color(item) {
      return item.percent >= 350 ? "red" : "orange";
    }
  }
};
</script>

<style>
.listBox {
  margin: 36px;
}
.empix {
  font-size: small;
  font-family: "Turret Road", cursive;
}
</style>