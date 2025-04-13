<template>
  <div class="home-container">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">加载失败: {{ error }}</div>
    <div v-else class="posts-container">
      <router-link 
        to="/create-post" 
        class="create-post-button"
      >
        创建新文章
      </router-link>
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

.home-container {
  padding: 16px;
}

.post {
  display: block;
  width: 100%;
  margin: 16px 0;
  padding: 20px;
  background-color: var(--surface);
  border-radius: 16px;
  text-align: left;
  text-decoration: none;
  color: var(--text-color);
  transition: all 0.3s ease;
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.post:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.post h2 {
  margin: 0 0 12px 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-color);
}

.create-post-button {
  display: inline-block;
  padding: 12px 24px;
  margin-bottom: 20px;
  background-color: var(--primary);
  color: var(--on-primary);
  border-radius: 20px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.create-post-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  opacity: 0.9;
}

.post-content {
  margin-top: 12px;
  color: var(--secondary);
  font-size: 1rem;
  line-height: 1.5;
}

.read-more {
  margin-top: 16px;
  color: var(--primary);
  font-size: 0.875rem;
  font-weight: 500;
}

.loading, .error {
  padding: 24px;
  font-size: 1rem;
  text-align: center;
  color: var(--text-color);
}

.error {
  color: #ff4444;
}
</style>
