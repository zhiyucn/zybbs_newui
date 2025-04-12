module.exports = {
  devServer: {
    disableHostCheck: true,
    proxy: {
      '/api': {
        target: 'https://bbs.zhiyuhub.top',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': '/api'
        }
      },
      '/client': {
        target: 'https://bbs.zhiyuhub.top',
        changeOrigin: true,
        secure: false
      }
    }
  }
}
