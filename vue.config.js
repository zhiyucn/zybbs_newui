module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://bbs.zhiyuhub.top',
        changeOrigin: true
      }
    }
  }
}
