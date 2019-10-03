import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false
import VueSocketIO from 'vue-socket.io'
 
Vue.use(new VueSocketIO({
    debug: false,
    connection: 'http://localhost:4000',
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    },
}))
new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
