import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import HighchartsVue from 'highcharts-vue';
import '@babel/polyfill'

Vue.config.productionTip = false

Vue.use(HighchartsVue);

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
