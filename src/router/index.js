import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/Home.vue'
import PostDetail from '../views/PostDetail.vue'
import LoginPage from '../views/Login.vue'
import CreatePost from '../views/CreatePost.vue'
import UISelect from '../views/UISelect.vue'

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
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage
    },
    {
      path: '/create-post',
      name: 'CreatePost',
      component: CreatePost
    },
    {
      path: '/ui-select',
      name: 'UISelect',
      component: UISelect
    }
  ]
})

export default router
