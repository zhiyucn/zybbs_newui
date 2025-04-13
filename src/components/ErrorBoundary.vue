<template>
  <slot v-if="!hasError" />
  <div v-else class="error-boundary">
    <h3>应用发生错误</h3>
    <p>{{ error }}</p>
    <button @click="resetError">重试</button>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ErrorBoundary',
  setup() {
    const hasError = ref(false)
    const error = ref(null)

    const errorHandler = (err) => {
      hasError.value = true
      error.value = err.message
      console.error('Error caught by boundary:', err)
    }

    const resetError = () => {
      hasError.value = false
      error.value = null
    }

    return {
      hasError,
      error,
      errorHandler,
      resetError
    }
  },
  errorCaptured(err) {
    this.errorHandler(err)
    return false
  }
}
</script>

<style scoped>
.error-boundary {
  padding: 20px;
  background-color: #ffebee;
  color: #b71c1c;
  border-radius: 8px;
  text-align: center;
}

.error-boundary h3 {
  margin-bottom: 10px;
}

.error-boundary button {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: #b71c1c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-boundary button:hover {
  background-color: #7f0000;
}
</style>
