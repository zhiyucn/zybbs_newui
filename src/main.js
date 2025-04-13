import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

router.beforeEach((to, from, next) => {
  const hasChosenUI = localStorage.getItem('uiVersion')
  
  if (!hasChosenUI && to.path !== '/ui-select') {
    next('/ui-select')
  } else {
    next()
  }
})

app.use(router)
app.use(ElementPlus)
app.mount('#app')
