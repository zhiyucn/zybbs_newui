<template>
  <div :class="{ 'dark-mode': isDarkMode }">
    <ErrorBoundary>
      <div class="app-container">
        <div class="header">
          <h1 class="title">智宇论坛新UI测试</h1>
          <img class="logo" alt="Vue logo" src="./assets/logo.png">
          <div class="auth-section" v-if="!isLoggedIn">
            <button 
              class="login-button" 
              @click="$router.push('/login')"
            >
              登录
            </button>
          </div>
          <div class="auth-section" v-else>
            <span class="welcome-message">
              欢迎, {{ userName }}
            </span>
            <button 
              class="logout-button" 
              @click="logout"
            >
              登出
            </button>
          </div>
          <button class="theme-toggle" @click="toggleTheme">
            {{ isDarkMode ? '浅色模式' : '深色模式' }}
          </button>
        </div>
        <router-view></router-view>
      </div>
    </ErrorBoundary>
  </div>
</template>

<script>
import { ref, provide, onMounted, computed, watch } from 'vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import axios from 'axios'
import { useCookies } from 'vue3-cookies'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  components: {
    ErrorBoundary
  },
  setup() {
    const { cookies } = useCookies()
    const router = useRouter()
    const posts = ref([])
    const loading = ref(false)
    const error = ref(null)
    const isDarkMode = ref(false)
    const userMap = ref({})
    const isLoggedIn = ref(false)
    const currentUser = ref(null)

    // 初始化主题
    onMounted(() => {
      // 检查localStorage
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        isDarkMode.value = savedTheme === 'dark'
      } else {
        // 检查系统偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        isDarkMode.value = prefersDark
      }
    })

    // 监听系统偏好变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        isDarkMode.value = e.matches
      }
    })

    // 监听主题变化并保存
    watch(isDarkMode, (newVal) => {
      localStorage.setItem('theme', newVal ? 'dark' : 'light')
    })
    
    // 计算用户名
    const userName = computed(() => {
      if (!currentUser.value) return '用户'
      return userMap.value[currentUser.value] || currentUser.value
    })

    // 检查登录状态
    const checkAuthStatus = () => {
      const token = cookies.get('auth_token')
      const userId = cookies.get('user_id')
      isLoggedIn.value = !!token
      currentUser.value = userId || null
    }

    // 登出
    const logout = () => {
      cookies.remove('auth_token')
      cookies.remove('user_id')
      isLoggedIn.value = false
      currentUser.value = null
      router.push('/')
    }

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
      checkAuthStatus()
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
    provide('isLoggedIn', isLoggedIn)
    provide('currentUser', currentUser)

    return {
      isDarkMode,
      toggleTheme,
      isLoggedIn,
      currentUser,
      logout,
      userName
    }
  }
}
</script>

<style>
:root {
  /* Material You 浅色主题 */
  --bg-color: #FEF7FF;
  --text-color: #1C1B1F;
  --border-color: #CAC4D0;
  --post-bg: #FEF7FF;
  --header-bg: #EADDFF;
  --link-color: #6750A4;
  --meta-color: #49454F;
  --surface: #FFFBFE;
  --primary: #6750A4;
  --on-primary: #FFFFFF;
  --secondary: #625B71;
}

.dark-mode {
  /* Material You 深色主题 */
  --bg-color: #141218;
  --text-color: #E6E1E5;
  --border-color: #49454F;
  --post-bg: #1D1B20;
  --header-bg: #381E72;
  --link-color: #D0BCFF;
  --meta-color: #CAC4D0;
  --surface: #1D1B20;
  --primary: #D0BCFF;
  --on-primary: #381E72;
  --secondary: #CCC2DC;
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
  margin-bottom: 24px;
  padding: 12px 16px;
  background-color: var(--header-bg);
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.auth-section {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.welcome-message {
  color: var(--text-color);
}

.login-button,
.logout-button {
  padding: 12px 24px;
  background-color: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 14px;
  transition: all 0.2s ease;
}

.login-button:hover,
.logout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.login-button:hover,
.logout-button:hover {
  opacity: 0.9;
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
  margin: 24px 0;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--surface);
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.post:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.post-content {
  margin-top: 10px;
  color: var(--text-color);
}
</style>
