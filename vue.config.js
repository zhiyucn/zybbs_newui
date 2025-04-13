const { all } = require("core-js/features/promise");

module.exports = {
  devServer: {
    port : 2398,
    // 修改主域名
    host: 'newui.bbs.zhiyuhub.top',
    allowedHosts: ['newui.bbs.zhiyuhub.top'],
    proxy: {
      '/api': {
        target: 'https://bbs.zhiyuhub.top',
        changeOrigin: true
      }
    }
  }
}
