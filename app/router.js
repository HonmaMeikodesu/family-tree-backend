'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  const loginStateAuth = app.middleware.loginStateAuth()
  router.get('/', controller.home.index)
  router.post('/register', controller.user.user.register)
  router.post('/login', controller.user.user.login)

}
