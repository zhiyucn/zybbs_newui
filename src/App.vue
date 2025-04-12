<template>
  <div :class="{ 'dark-mode': isDarkMode }">
    <div class="app-container">
      <div class="header">
        <h1 class="title">智宇论坛新UI测试</h1>
        <img class="logo" alt="Vue logo" src="./assets/logo.png">
        <button class="theme-toggle" @click="toggleTheme">
          {{ isDarkMode ? '浅色模式' : '深色模式' }}
        </button>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { ref, provide, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'App',
  setup() {
    const posts = ref([])
    const loading = ref(false)
    const error = ref(null)
    const isDarkMode = ref(false)
    const userMap = ref({})

    // 检测系统颜色偏好
    const checkSystemTheme = () => {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    // 切换主题
    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
    }

    // 获取用户ID到用户名的映射
    const fetchUserMap = async () => {
      try {
        const response = await axios.get('/api/client/user_id_to_username')
        userMap.value = response.data
      } catch (err) {
        console.error('Error fetching user map:', err)
      }
    }

    const fetchPosts = async () => {
      loading.value = true
      error.value = null
      try {
        const response = await axios.get('/api/get_posts')
        posts.value = response.data.reverse()
      } catch (err) {
        console.error('Error fetching posts:', err)
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      checkSystemTheme()
      fetchUserMap()
      fetchPosts()
      
      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', checkSystemTheme)
    })

    // Provide global state to child components
    provide('posts', posts)
    provide('loading', loading)
    provide('error', error)
    provide('userMap', userMap)
    provide('isDarkMode', isDarkMode)

    return {
      isDarkMode,
      toggleTheme
    }
  }
}
</script>

<style>
:root {
  --bg-color: #ffffff;
  --text-color: #2c3e50;
  --border-color: #ddd;
  --post-bg: #ffffff;
  --header-bg: #f8f9fa;
  --link-color: #1890ff;
  --meta-color: #666;
}

.dark-mode {
  --bg-color: #1a1a1a;
  --text-color: #f0f0f0;
  --border-color: #444;
  --post-bg: #2d2d2d;
  --header-bg: #222;
  --link-color: #58a6ff;
  --meta-color: #aaa;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}

p {
  margin: 0;
  padding: 0;
}

.dark-mode p {
  color: #f0f0f0;
}
.app-container {
  width: 100%;
  height: 100%;
  min-width: 320px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  background-color: var(--bg-color);
  color: var(--text-color);
  overflow-x: hidden;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: var(--header-bg);
  border-radius: 8px;
}

.title {
  margin-right: 15px;
  font-size: 18px;
  color: var(--text-color);
}

.logo {
  width: 40px;
  height: 40px;
}

.theme-toggle {
  margin-left: auto;
  padding: 5px 10px;
  background-color: var(--post-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}

.post {
  display: block;
  margin: 20px 0;
  padding: 15px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background-color: var(--post-bg);
  transition: background-color 0.3s, border-color 0.3s;
}

.post-content {
  margin-top: 10px;
  color: var(--text-color);
}
</style>
