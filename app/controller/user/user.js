'use strict'

const Controller = require('egg').Controller

class UserController extends Controller {
  async register() {
    const { ctx } = this
    ctx.validate({
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
    await ctx.service.user.user.validateNewUserInfo(user_id, verify_user_id, id_card)
    // 将注册用户信息存入数据库
    await ctx.service.user.user.creatNewUserInDb(user_id, password, name, secure_q, secure_a, id_card)
    // 当不是夫妻关系时，向审核者发出审核请求，准备在家族树插入新成员
    if (verify_user_relation !== 3) { await ctx.service.user.user.newUserVerifyRequest(user_id, verify_user_id, verify_user_relation) }
    ctx.body = '0'
  }
  async login() {
    const { ctx } = this
    ctx.validate({
      user_id: 'string',
      password: 'string'
    }, ctx.request.body)
    const { user_id, password } = ctx.request.body
    // 验证账号密码
    const skey = await ctx.service.user.user.validateAccount(user_id, password)
    // 设置用户登陆态
    ctx.cookies.set('skey', skey)
    // 返回用户权限给前端
    const permission = await ctx.service.user.user.getPermission(user_id)
    ctx.body = { permission }
  }
  async getReview() {
    const { ctx } = this
    const review = await ctx.service.user.user.getReviewFromDb(ctx.user_id)
    ctx.body = review
  }
  async confirmReview() {
    const { ctx } = this
    ctx.validate({
      passive_user_id: 'string',
      relation: {
        convertType: 'int',
        type: 'enum',
        values: [ 1, 2 ]
      },
      confirm_state: {
        convertType: 'boolean',
        type: 'boolean?',
        default: false
      }
    }, ctx.query)
    const { passive_user_id, confirm_state, relation } = ctx.query
    await ctx.service.user.user.insertEventHandler(ctx.user_id, passive_user_id, confirm_state, relation)
    const result = await ctx.service.user.user.getReviewFromDb(ctx.user_id)
    ctx.body = result
  }
  async getTree() {
    const { ctx } = this
    const node_list = await ctx.service.user.user.getTreeNodesFromDb()
    ctx.body = node_list
  }
  async insertByAdmin() {
    const { ctx } = this
    ctx.validate({
      subject_user_id: 'string',
      passive_user_id: 'string',
      relation: {
        convertType: 'int',
        type: 'enum',
        values: [ 1, 2 ]
      }
    }, ctx.query)
    const { subject_user_id, passive_user_id, relation } = ctx.query
    // 验证id是否存在
    await ctx.service.user.user.validateTreeId(subject_user_id)
    await ctx.service.user.user.insertIntoTree(subject_user_id, passive_user_id, relation)
    ctx.body = '0'
  }
  async deleteByAdmin() {
    const { ctx } = this
    ctx.validate({
      delete_user_id: 'string'
    }, ctx.query)
    // 验证id是否存在
    await ctx.service.user.user.validateTreeId(ctx.query.delete_user_id)
    await ctx.service.user.user.deleteFromTree(ctx.query.delete_user_id)
    ctx.body = '0'
  }
}

module.exports = UserController
