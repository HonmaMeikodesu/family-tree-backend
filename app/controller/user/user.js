'use strict'

const Controller = require('egg').Controller

class UserController extends Controller {
  async register() {
    const { ctx, app } = this
    app.validator.validate({
      user_id: 'string',
      name: 'string',
      password: 'string',
      secure_q: 'string',
      secure_a: 'string',
      id_card: 'string',
      verify_user_id: 'string',
      verify_user_relation: {
        convertType: 'int',
        type: 'enum',
        values: [ 1, 2, 3 ]
      }
    }, ctx.request.body)
    const { user_id, password, name, secure_q, secure_a, id_card, verify_user_id, verify_user_relation } = ctx.request.body
    // 检验输入正确性
    await ctx.service.user.user.validateNewUserInfo(user_id, verify_user_id)
    // 将注册用户信息存入数据库
    await ctx.service.user.user.creatNewUserInDb(user_id, password, name, secure_q, secure_a, id_card)
    // 当不是夫妻关系时，向审核者发出审核请求，准备在家族树插入新成员
    if (verify_user_relation !== 3) { await ctx.service.user.user.newUserVerifyRequest(user_id, verify_user_id, verify_user_relation) }
    ctx.body = '0'
  }
  async login() {
    const { ctx, app } = this
    app.validator.validate({
      user_id: 'string',
      password: 'string'
    }, ctx.request.body)
    const { user_id, password } = ctx.request.body
    const skey = await ctx.service.user.user.validateAccount(user_id, password)
    ctx.cookies.set('skey', skey)
    ctx.body = '0'
  }
}

module.exports = UserController