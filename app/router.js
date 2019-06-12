'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  const loginStateAuth = app.middleware.loginStateAuth()
  const userPermissionAuth = app.middleware.userPermissionAuth()
  router.get('/', controller.home.index)
  // 注册以及登录页面
  router.post('/api/register', controller.user.user.register)
  router.post('/api/login', controller.user.user.login)
  // 审核页面
  router.get('/api/getReview', loginStateAuth, controller.user.user.getReview)
  router.get('/api/reviewConfirm', loginStateAuth, controller.user.user.confirmReview)
  // 家族树渲染
  router.get('/api/getTree', loginStateAuth, controller.user.user.getTree)
  // 后台管理界面
  // todo 鉴权暂时交由前端处理，用户登陆后后端返回该用户的permission给前端
  router.get('/api/insertByAdmin', loginStateAuth, userPermissionAuth, controller.user.user.insertByAdmin)
  router.get('/api/deleteByAdmin', loginStateAuth, userPermissionAuth, controller.user.user.deleteByAdmin)
  router.post('/api/editUserInfo', loginStateAuth, controller.user.user.editUserInfo)
  router.get('/api/offerAdmin', loginStateAuth, userPermissionAuth, controller.user.user.offerAdmin)
  router.get('/api/dismissAdmin', loginStateAuth, userPermissionAuth, controller.user.user.dismissAdmin)
  router.post('/api/addPost', loginStateAuth, userPermissionAuth, controller.user.user.addPost)
  router.get('/api/deletePost', loginStateAuth, userPermissionAuth, controller.user.user.deletePost)
}
