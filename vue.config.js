const { all } = require("core-js/features/promise");

module.exports = {
  devServer: {
    allowedHosts: ['newui.bbs.zhiyuhub.top'],
    proxy: {
      '/api': {
        target: 'https://bbs.zhiyuhub.top',
        changeOrigin: true
      }
    }
  }
}
