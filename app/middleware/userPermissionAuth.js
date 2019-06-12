'use strict'

module.exports = options => {
  return async function loginStateAuth(ctx, next) {
    const permission = ctx.cookies.get('permission')
    if (!permission) throw (new Error('找不到该用户权限'))
    // 校验用户是否具有管理员身份
    if (permission !== '2') throw (new Error('用户不是管理员，不能使用此功能'))
    // 用户是管理员
    await next()
  }
}
