<template>
  <div class="create-post">
    <h1>创建新帖子</h1>
    <form @submit.prevent="submitPost">
      <div class="form-group">
        <label for="title">标题</label>
        <input
          type="text"
          id="title"
          v-model="post.title"
          required
          placeholder="请输入帖子标题"
        />
      </div>
      
      <div class="form-group">
        <label>内容</label>
        <div id="vditor" ref="vditor"></div>
      </div>
      
      <button type="submit" class="submit-btn">发布</button>
    </form>
  </div>
</template>

<script>
import { inject, ref, onMounted, watch } from 'vue'
import axios from 'axios'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { ElNotification } from 'element-plus'
import { useCookies } from 'vue3-cookies'

export default {
  name: 'CreatePost',
  setup() {
    const isDarkMode = inject('isDarkMode')
    const vditor = ref(null)
    const post = ref({
      title: '',
      content: ''
    })

    onMounted(() => {
      initEditor()
    })

    watch(isDarkMode, () => {
      if (vditor.value) {
        vditor.value.setTheme(isDarkMode.value ? 'dark' : 'classic')
      }
    })

    const initEditor = () => {
      vditor.value = new Vditor('vditor', {
        height: 500,
        theme: isDarkMode.value ? 'dark' : 'classic',
        mode: 'wysiwyg',
        toolbar: [
          'emoji',
          'headings',
          'bold',
          'italic',
          'strike',
          'link',
          '|',
          'list',
          'ordered-list',
          'check',
          'outdent',
          'indent',
          '|',
          'quote',
          'line',
          'code',
          'inline-code',
          'insert-before',
          'insert-after',
          '|',
          'upload',
          'table',
          '|',
          'undo',
          'redo',
          '|',
          'fullscreen',
          'preview'
        ],
        ready: () => {
          vditor.value.setValue(post.value.content)
        },
        input: (content) => {
          post.value.content = content
        }
      })
    }

    return {
      vditor,
      post,
      isDarkMode
    }
  },
  methods: {
    async submitPost() {
      const { cookies } = useCookies()
      try {
        // 确保获取编辑器内容
        if (this.vditor && this.vditor.value) {
          // 保存原始Markdown内容，由显示页面实时解析
          this.post.content = this.vditor.value.getValue()
        }

        // 验证内容不为空
        if (!this.post.content || this.post.content.trim() === '') {
          ElNotification({
            title: '内容不能为空',
            message: '请输入帖子内容',
            type: 'warning',
            duration: 3000,
            offset: 60
          })
          return
        }

        const token = cookies.get('auth_token')
        const userId = cookies.get('user_id')
        
        if (!token || !userId) {
          ElNotification({
            title: '需要登录',
            message: '请先登录后再发布帖子',
            type: 'warning',
            duration: 3000,
            offset: 60
          })
          this.$router.push('/login')
          return
        }

        console.log('Sending request with token:', token) // 添加调试日志
        console.log('Sending request with userId:', userId) // 添加调试日志

        const response = await axios.post(
          '/api/client/create_post',
          {
            title: this.post.title,
            content: this.post.content,

            token: token, // 显式添加token到请求体
            user_id: userId // 显式添加user_id到请求体
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'user-id': userId
            }
          }
        )

        if (response.data.status === 'ok') {
          ElNotification({
            title: '成功',
            message: '帖子发布成功',
            type: 'success',
            duration: 3000,
            offset: 60
          })
          this.$router.push(`/post/${response.data.post_id}`)
        } else {
          ElNotification({
            title: '发布失败',
            message: response.data.message || '发布失败，请重试',
            type: 'error',
            duration: 3000,
            offset: 60
          })
        }
      } catch (error) {
        console.error(error)
        ElNotification({
          title: '错误',
          message: '发布失败，请检查网络后重试',
          type: 'error',
          duration: 3000,
          offset: 60
        })
      }
    }
  }
}
</script>

<style scoped>
.create-post {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

input[type="text"] {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 16px;
  background-color: var(--surface);
  color: var(--text-color);
}

.submit-btn {
  background-color: var(--primary);
  color: var(--on-primary);
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

.submit-btn:hover {
  opacity: 0.9;
}
</style>

<style>
/* Vditor 深色模式样式 */
.dark-mode .vditor {
  --panel-background-color: var(--post-bg) !important;
  --toolbar-background-color: var(--header-bg) !important;
  --textarea-background-color: var(--post-bg) !important;
  --textarea-text-color: var(--text-color) !important;
  --toolbar-icon-color: var(--text-color) !important;
  --toolbar-icon-hover-color: var(--primary) !important;
}

/* 调整Vditor边框颜色 */
.vditor {
  border-color: var(--border-color) !important;
  border-radius: 8px;
  overflow: hidden;
}
</style>
