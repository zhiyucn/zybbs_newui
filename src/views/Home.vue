<template>
  <div class="home-container">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">加载失败: {{ error }}</div>
    <div v-else class="posts-container">
      <router-link 
        v-for="post in posts" 
        :key="post.id" 
        :to="`/post/${post.id}`"
        class="post"
      >
        <h2>{{ post.title }}</h2>
        <div class="post-content" v-html="renderPreview(post.content)"></div>
        <div class="read-more">点击查看全文</div>
      </router-link>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue'
import { marked } from 'marked'

export default {
  name: 'HomePage',
  setup() {
    const posts = inject('posts')
    const loading = inject('loading')
    const error = inject('error')

    const renderPreview = (content) => {
      const html = marked(content || '')
      const div = document.createElement('div')
      div.innerHTML = html
      const text = div.textContent || div.innerText || ''
      return marked(text.substring(0, 10) + (text.length > 10 ? '...' : ''))
    }

    return {
      posts,
      loading,
      error,
      renderPreview
    }
  }
}
</script>

<style scoped>
.home-container {
  height: 100%;
}

.posts-container {
  margin: 0;
  padding: 20px;
}

.post {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  text-align: left;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.post:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.post-content {
  margin-top: 10px;
  color: #666;
}

.read-more {
  margin-top: 10px;
  color: #1890ff;
  font-size: 14px;
}

.loading, .error {
  padding: 20px;
  font-size: 18px;
  text-align: center;
}

.error {
  color: #ff4444;
}
</style>
