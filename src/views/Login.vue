<template>
  <div class="login-container">
    <h2>用户登录</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">用户名</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          required
          placeholder="请输入用户名"
        />
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          placeholder="请输入密码"
        />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useCookies } from 'vue3-cookies'

export default {
  name: 'LoginPage',
  setup() {
    const { cookies } = useCookies()
    const router = useRouter()
    const form = ref({
      username: '',
      password: ''
    })
    const loading = ref(false)
    const error = ref('')

    const handleSubmit = async () => {
      loading.value = true
      error.value = ''
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        }
        const response = await axios.post('/api/client/login', form.value, config)
        if (response.data.status === 'ok') {
          // 设置token到cookie，有效期1小时
          cookies.set('auth_token', response.data.token, 60 * 60)
          cookies.set('user_id', response.data.user_id, 60 * 60)
          router.push('/')
        } else {
          error.value = response.data.message || '登录失败'
        }
      } catch (err) {
        error.value = err.response?.data?.message || '网络错误，请稍后重试'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--surface);
  border-radius: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  font-size: 1.5rem;
  font-weight: 500;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--secondary);
  font-size: 0.875rem;
}

input {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  background-color: var(--surface);
  color: var(--text-color);
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

input:focus {
  outline: none;
  border-color: var(--primary);
}

button {
  width: 100%;
  padding: 1rem;
  background-color: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: 1.5rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: all 0.2s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  color: #ff4d4f;
  text-align: center;
  font-size: 0.875rem;
}
</style>
