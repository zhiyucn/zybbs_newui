const { all } = require("core-js/fn/promise");

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
