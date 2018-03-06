// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import Vuex from 'vuex'
import VueLazyload from 'vue-lazyload'
import infiniteScroll from 'vue-infinite-scroll'


import './assets/css/base.css'
import './assets/css/checkout.css'
import './assets/css/login.css'
import './assets/css/product.css'

Vue.config.productionTip = false
Vue.use(Vuex);
Vue.use(VueLazyload, {
  loading: 'static/loading-svg/loading-bars.svg',
  try: 3 // default 1
})
Vue.use(infiniteScroll);

const store = new Vuex.Store({
  state:{
    nickName: '',
    cartCount: 0
  },
  mutations:{
    //更新用户名
    updateUserInfo(state,nickName){
      state.nickName = nickName;
    },
    //计算购物车数量
    updateCartCount(state,cartCount){
      state.cartCount += cartCount;
    },
    //初始化购物车数量
    initCartCount(state,cartCount){
      state.cartCount = cartCount;
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
})
