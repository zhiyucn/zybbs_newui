<template>
  <div class="ui-select-container">
    <h1>选择UI版本</h1>
    <div class="buttons">
      <button @click="useNewUI" class="new-ui-btn">使用新版UI</button>
      <button @click="useOldUI" class="old-ui-btn">继续使用旧版UI</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UISelect',
  methods: {
    useNewUI() {
      localStorage.setItem('uiVersion', 'new')
      this.$router.push('/')
    },
    useOldUI() {
      localStorage.setItem('uiVersion', 'old')
      window.location.href = 'https://bbs.zhiyuhub.top/'
    }
  }
}
</script>

<style scoped>
.ui-select-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.buttons {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

.new-ui-btn, .old-ui-btn {
  padding: 12px 24px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.new-ui-btn {
  background-color: #42b983;
  color: white;
}

.old-ui-btn {
  background-color: #f56c6c;
  color: white;
}
</style>
