<template>
  <div class="post-detail">
    <router-link to="/" class="back-link">← 返回列表</router-link>
    <h1>{{ post.title }}</h1>
    <div class="post-meta">
      <span>ID: {{ post.id }}</span>
      <span>作者: {{ getUserName(post.user_id) }}</span>
    </div>
    <div class="post-content" v-html="renderMarkdown(post.content)"></div>
    
    <div class="comments-section">
      <h2>评论</h2>
      <div v-if="loadingComments" class="loading">加载中...</div>
      <div v-else-if="commentsError" class="error">加载评论失败: {{ commentsError }}</div>
      <div v-else>
        <div v-if="comments.length === 0" class="no-comments">暂无评论</div>
        <div v-else class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment">
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-meta">用户ID: {{ comment.user_id }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { inject, computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import axios from 'axios'

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

    const post = computed(() => {
      return posts.value.find(p => p.id === postId) || {}
    })

    const getUserName = (userId) => {
      return userMap.value[userId] || `用户${userId}`
    }

    const renderMarkdown = (content) => {
      return marked(content || '')
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

    onMounted(() => {
      fetchComments()
    })

    return {
      post,
      comments,
      loadingComments,
      commentsError,
      getUserName,
      renderMarkdown,
      isDarkMode
    }
  }
}
</script>

<style scoped>
.comments-section {
  width: 100%;
  margin-top: 30px;
  padding: 20px;
  background-color: var(--bg-color);
  border-radius: 8px;
  box-sizing: border-box;
}

.comments-section h2 {
  margin-bottom: 15px;
  color: var(--text-color);
  font-size: 1.2em;
}

.comment-list {
  width: 100%;
  margin-top: 10px;
}

.comment {
  width: 100%;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background-color: var(--post-bg);
  box-sizing: border-box;
}

.comment-content {
  width: 100%;
  color: var(--text-color);
  margin-bottom: 5px;
  word-break: break-word;
}

.comment-meta {
  width: 100%;
  font-size: 14px;
  color: var(--meta-color);
}

.loading, .error, .no-comments {
  width: 100%;
  padding: 15px;
  text-align: center;
  color: var(--text-color);
  box-sizing: border-box;
}

.error {
  color: #ff4444;
}
</style>

<style scoped>
.post-detail {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  color: var(--text-color);
  background-color: var(--bg-color);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.back-link {
  display: inline-block;
  margin-bottom: 20px;
  color: var(--link-color);
  text-decoration: none;
}

.post-meta {
  margin: 10px 0;
  color: var(--meta-color);
  font-size: 14px;
}

.post-meta span {
  margin-right: 15px;
}

.post-content {
  margin-top: 20px;
  line-height: 1.6;
}

:root {
  --text-color: #2c3e50;
  --link-color: #1890ff;
  --meta-color: #666;
}

.dark-mode {
  --text-color: #f0f0f0;
  --link-color: #58a6ff;
  --meta-color: #aaa;
}
</style>
