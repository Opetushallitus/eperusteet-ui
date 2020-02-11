import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'

Vue.use(VueRouter)

const routes = [{
  path: '/',
  name: 'root',
  component: Home,
}, {
  path: '/about',
  name: 'about',
}]

const router = new VueRouter({
  routes
})

export default router
