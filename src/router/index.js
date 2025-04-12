import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/Home.vue'
import PostDetail from '../views/PostDetail.vue'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage
    },
    {
      path: '/post/:id',
      name: 'PostDetail',
      component: PostDetail,
      props: true
    }
  ]
})

export default router
