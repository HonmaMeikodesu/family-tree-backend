'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  const loginStateAuth = app.middleware.loginStateAuth()
  router.get('/', controller.home.index)
  // 注册以及登录页面
  router.post('/register', controller.user.user.register)
  router.post('/login', controller.user.user.login)
  // 审核页面
  router.get('/getReview', loginStateAuth, controller.user.user.getReview)
  router.get('/reviewConfirm', loginStateAuth, controller.user.user.confirmReview)
  // 家族树渲染
  router.get('/getTree', loginStateAuth, controller.user.user.getTree)
}
