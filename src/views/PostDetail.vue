<template>
  <div class="post-detail">
    <router-link to="/" class="back-link">← 返回列表</router-link>
    <h1>{{ post.title }}</h1>
    <div class="post-meta">
      <span>ID: {{ post.id }}</span>
      <span>作者: {{ getUserName(post.user_id) }}</span>
    </div>
    <template v-if="error">
      <div class="error">加载失败: {{ error }}</div>
    </template>
    <template v-else>
      <div v-if="!isLoading" class="post-content" v-html="renderMarkdown(post.content)"></div>
      <div v-else class="loading">加载中...</div>
    </template>
    
    <div class="comments-section">
      <h2>评论</h2>
      <div v-if="loadingComments" class="loading">加载中...</div>
      <div v-else-if="commentsError" class="error">加载评论失败: {{ commentsError }}</div>
      <div v-else>
        <div class="comment-form">
          <div class="mdc-text-field mdc-text-field--textarea">
            <textarea 
              v-model="newComment"
              class="mdc-text-field__input"
              rows="3"
              :disabled="submitting"
              placeholder=" "
            ></textarea>
            <label class="mdc-floating-label">请输入评论内容</label>
            <div class="mdc-line-ripple"></div>
          </div>
          <div class="form-actions">
            <el-button
              type="primary"
              :loading="submitting"
              @click="handleCommentSubmit"
            >
              提交评论
            </el-button>
          </div>
          <div v-if="submitError" class="error-message">
            {{ submitError }}
          </div>
        </div>
        <div v-if="comments.length" class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment">
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-meta">
              {{ getUserName(comment.user_id) }}
            </div>
          </div>
        </div>
        <div v-else class="no-comments">暂无评论</div>
      </div>
    </div>
  </div>
</template>

<script>
import { inject, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import axios from 'axios'
import { useCookies } from 'vue3-cookies'

export default {
  name: 'PostDetail',
  setup() {
    const route = useRoute()
    const posts = inject('posts')
    const userMap = inject('userMap')
    const isDarkMode = inject('isDarkMode')
    const postId = parseInt(route.params.id)

    const comments = ref([])
    const loadingComments = ref(false)
    const commentsError = ref(null)
    const { cookies } = useCookies()
    const newComment = ref('')
    const submitting = ref(false)
    const submitError = ref('')

    const post = ref({
      title: '',
      content: '',
      id: '',
      user_id: ''
    })

    const isLoading = ref(true)
    const error = ref(null)

    const loadPostData = async () => {
      try {
        isLoading.value = true
        error.value = null
        
        const foundPost = posts.value.find(p => p.id === postId)
        if (foundPost) {
          post.value = foundPost
        } else {
          // 如果posts中没有，尝试从API加载
        const response = await axios.get(`/api/proxy/bbs.zhiyuhub.top/api/get_post/${postId}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (response.data && response.data.status === 'ok') {
          post.value = response.data.data
        } else {
          throw new Error(response.data?.message || '获取帖子详情失败')
        }
        }
      } catch (err) {
        console.error('加载帖子失败:', err)
        error.value = err.message
      } finally {
        isLoading.value = false
      }
    }

    const getUserName = (userId) => {
      return userMap.value[userId] || `用户${userId}`
    }

    const renderMarkdown = (content) => {
      console.log('原始Markdown内容:', content) // 调试日志
      
      // 配置marked选项确保标题解析
      marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        headerPrefix: '',
        smartypants: true,
        xhtml: true
      })

      // 创建自定义渲染器
      const renderer = new marked.Renderer()
      renderer.link = (href, title, text) => {
        // 安全处理href参数
        const cleanHref = (typeof href === 'string' && (href.startsWith('http') || href.startsWith('#'))) 
          ? href 
          : '#'
        return `<a href="${cleanHref}" target="_blank" rel="noopener noreferrer">${text}</a>`
      }

      // 强制将#开头的行转换为标准Markdown标题格式
      const normalizedContent = (content || '')
        .split('\n')
        .map(line => {
          // 匹配1-6个#开头的行
          const headingMatch = line.match(/^(#{1,6})\s*(.*)$/)
          if (headingMatch) {
            return `${headingMatch[1]} ${headingMatch[2].trim()}`
          }
          return line
        })
        .join('\n')
        .trim()
      
      // 使用lexer和parser进行更精确的解析
      const tokens = marked.lexer(normalizedContent)
      console.log('Markdown tokens:', tokens)
      
      const html = marked.parser(tokens, { renderer })
      console.log('解析后的HTML:', html) // 调试日志
      
      return html
    }

    const fetchComments = async () => {
      loadingComments.value = true
      commentsError.value = null
      try {
        const response = await axios.get(`/api/client/get_comments/${postId}`)
        comments.value = response.data
      } catch (err) {
        console.error('Error fetching comments:', err)
        commentsError.value = err.message
      } finally {
        loadingComments.value = false
      }
    }

    const handleCommentSubmit = async () => {
      submitError.value = ''
      if (!newComment.value.trim()) {
        submitError.value = '评论内容不能为空'
        return
      }

      submitting.value = true
      try {
        const response = await axios.post(
          `/api/client/create_comment/${postId}`,
          {
            token: cookies.get('auth_token'),
            content: newComment.value
          }
        )

        if (response.data.status === 'ok') {
          newComment.value = ''
          await fetchComments() // 刷新评论列表
        } else {
          submitError.value = response.data.message || '评论提交失败'
        }
      } catch (err) {
        submitError.value = err.response?.data?.message || '网络错误，请稍后重试'
      } finally {
        submitting.value = false
      }
    }

    onMounted(async () => {
      await loadPostData()
      await fetchComments()
    })

      return {
        post,
        comments,
        loadingComments,
        commentsError,
        getUserName,
        renderMarkdown,
        isDarkMode,
        isLoading,
        newComment,
        submitting,
        submitError,
        handleCommentSubmit
      }
  }
}
</script>

<style scoped>
.comments-section {
  width: 100%;
  margin-top: 32px;
  padding: 24px;
  background-color: var(--surface);
  border-radius: 16px;
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.comments-section h2 {
  margin-bottom: 16px;
  color: var(--text-color);
  font-size: 1.25rem;
  font-weight: 500;
}

.comment-list {
  width: 100%;
  margin-top: 16px;
}

.comment {
  width: 100%;
  padding: 16px;
  margin-bottom: 16px;
  background-color: var(--bg-color);
  border-radius: 12px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.comment:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.comment-content {
  width: 100%;
  color: var(--text-color);
  margin-bottom: 8px;
  word-break: break-word;
  line-height: 1.5;
  background-color: var(--bg-color);
}

.comment-meta {
  width: 100%;
  font-size: 0.875rem;
  color: var(--secondary);
  background-color: var(--bg-color);
}

.loading, .error, .no-comments {
  width: 100%;
  padding: 16px;
  text-align: center;
  color: var(--text-color);
  box-sizing: border-box;
  border-radius: 8px;
  background-color: var(--bg-color);
}

.error {
  color: #ff4444;
}

.comment-form {
  margin-bottom: 24px;
}

.mdc-text-field {
  width: 100%;
  margin-bottom: 16px;
  position: relative;
}

.mdc-text-field--textarea {
  min-height: 56px;
}

.mdc-text-field__input {
  width: 100%;
  min-height: 56px;
  padding: 16px;
  background-color: var(--surface-container);
  color: var(--on-surface);
  border: none;
  border-bottom: 1px solid var(--outline);
  font-size: 1rem;
  line-height: 1.5;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.mdc-text-field__input:focus {
  outline: none;
  border-bottom-color: var(--primary);
}

.mdc-floating-label {
  position: absolute;
  left: 16px;
  top: 22px;
  color: var(--on-surface-variant);
  pointer-events: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1rem;
  line-height: 1;
}

.mdc-text-field__input:focus + .mdc-floating-label,
.mdc-text-field__input:not(:placeholder-shown) + .mdc-floating-label {
  top: 6px;
  left: 12px;
  font-size: 0.75rem;
  color: var(--primary);
  background-color: var(--surface-container);
  padding: 0 4px;
}

.mdc-line-ripple {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary);
  transform: scaleX(0);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.mdc-text-field__input:focus ~ .mdc-line-ripple {
  transform: scaleX(1);
}

.form-actions {
  margin-top: 16px;
  text-align: right;
}

.form-actions .el-button {
  background-color: var(--primary);
  color: var(--on-primary);
  border-radius: 20px;
  padding: 8px 24px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.form-actions .el-button:hover {
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transform: translateY(-1px);
}

.form-actions .el-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.form-actions .el-button:active::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 1;
  }
  100% {
    transform: scale(20, 20);
    opacity: 0;
  }
}

.error-message {
  margin-top: 8px;
  color: var(--el-color-error);
  font-size: 0.875rem;
}

.no-comments {
  padding: 16px;
  text-align: center;
  color: var(--text-color);
  background-color: var(--bg-color);
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
}

.comment-list {
  margin-top: 16px;
}


.comment:hover {
  transform: translateY(-2px);
  box-shadow: var(--el-box-shadow);
}


.comment-meta {
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
}
</style>

<style scoped>
.post-detail {
  width: 100%;
  min-height: 100vh;
  padding: 16px;
  color: var(--text-color);
  background-color: var(--bg-color);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.back-link {
  display: inline-flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 8px 12px;
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.back-link:hover {
  background-color: var(--header-bg);
}

.post-meta {
  margin: 16px 0;
  color: var(--secondary);
  font-size: 0.875rem;
  display: flex;
  gap: 16px;
}

.post-content {
  margin-top: 24px;
  padding: 16px;
  background-color: var(--surface);
  border-radius: 16px;
  line-height: 1.6;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.post-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  background-color: white;
  padding: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.dark-mode .post-content img {
  background-color: var(--surface);
  border: 1px solid var(--border-color);
}
</style>
