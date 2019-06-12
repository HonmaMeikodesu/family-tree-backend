'use strict'

const Controller = require('egg').Controller

class UserController extends Controller {
  async register() {
    const { ctx } = this
    ctx.validate({
      user_id: 'string',
      name: 'string',
      password: 'string',
      id_card: 'string',
      verify_user_id: 'string',
      verify_user_relation: {
        convertType: 'int',
        type: 'enum',
        values: [ 1, 2, 3 ]
      }
    }, ctx.request.body)
    const { user_id, password, name, id_card, verify_user_id, verify_user_relation } = ctx.request.body
    // 检验输入正确性
    await ctx.service.user.user.validateNewUserInfo(user_id, verify_user_id, id_card)
    // 将注册用户信息存入数据库
    await ctx.service.user.user.creatNewUserInDb(user_id, password, name, id_card)
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
    // 设置用户权限
    ctx.cookies.set('permission', permission)
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
  async editUserInfo() {
    const { ctx } = this
    ctx.validate({
      work: 'string?',
      home_location: 'string?',
      work_location: 'string?',
      tele: 'string?',
      qq: 'string?',
      email: 'string?',
      interest: 'string?',
      avatar: 'string?',
      gender: {
        required: false,
        convertType: 'int',
        type: 'enum',
        values: [ 0, 1 ]
      },
      country: 'string?',
      birthday: 'date?'
    }, ctx.request.body)
    await ctx.service.user.user.editUserInfoInDb(ctx.user_id, ctx.request.body)
    ctx.body = '0'
  }
  async offerAdmin() {
    const { ctx } = this
    ctx.validate({
      employee_id: 'string'
    }, ctx.query)
    const flag = await ctx.service.user.user.findUser(ctx.query.employee_id)
    if (!flag) {
      throw (new Error('不存在该名用户'))
    }
    const permission = await ctx.service.user.user.getUserPermission(ctx.query.employee_id)
    if (!permission) {
      throw (new Error('该用户已经是管理员'))
    }
    await ctx.service.user.user.offerAdmin(ctx.query.employee_id)
    ctx.body = '0'
  }
  async dismissAdmin() {
    const { ctx } = this
    await ctx.service.user.user.dismissAdmin(ctx.user_id)
    ctx.body = '0'
  }
  async addPost() {
    const { ctx } = this
    ctx.validate({
      poster_title: 'string',
      poster_content: 'string',
    }, ctx.request.body)
    const { poster_title, poster_content } = ctx.request.body
    await ctx.service.user.user.addPost(ctx.user_id, poster_title, poster_content)
    ctx.body = '0'
  }
  async deletePost() {
    const { ctx } = this
    ctx.validate({
      poster_id: {
        convertType: 'int',
        required: 'true',
        type: 'int'
      }
    }, ctx.query)
    await ctx.service.user.user.deletePost(ctx.user_id,ctx.query.poster_id)
    ctx.body = '0'
  }
}

module.exports = UserController
