'use strict'

const Service = require('egg').Service

class UserService extends Service {

  async validateNewUserInfo(user_id, verify_user_id) {
    const { ctx } = this
    // 检测数据库是否已存在该用户
    let result = await ctx.app.model.query('SELECT COUNT(*) FROM user_name WHERE user_id = ?',
      { replacements: [ user_id ], type: ctx.app.Sequelize.QueryTypes.SELECT })
    if (result[0]['COUNT(*)'] !== 0) throw (new Error('已存在该名用户'))
    // 检测审核人是否存在
    result = await ctx.app.model.query('SELECT COUNT(*) FROM user_name WHERE user_id = ?',
      { replacements: [ verify_user_id ], type: ctx.app.Sequelize.QueryTypes.SELECT })
    if (result[0]['COUNT(*)'] === 0) throw (new Error('审核人不存在'))
  }

  async creatNewUserInDb(user_id, password, name, secure_q, secure_a, id_card) {
    const { ctx } = this
    ctx.app.model.query('INSERT INTO user_name(user_id,name) VALUES(?,?)',
      { replacements: [ user_id, name ], type: ctx.app.Sequelize.QueryTypes.INSERT })
    ctx.app.model.query('INSERT INTO user_account_info(user_id,password,secure_q,secure_a,id_card,permission) VALUES(?,?,?,?,?,?)',
      { replacements: [ user_id, password, secure_q, secure_a, id_card, 1 ], type: ctx.app.Sequelize.QueryTypes.INSERT })
  }

  async newUserVerifyRequest(user_id, verify_user_id, verify_user_relation) {
    const { ctx } = this
    await ctx.app.model.query('INSERT INTO insert_event(passive_user_id,subject_user_id,relation) VALUES(?,?,?)',
      { replacements: [ user_id, verify_user_id, verify_user_relation ], type: ctx.app.Sequelize.QueryTypes.INSERT })
  }
  async validateAccount(user_id, password) {
    const { ctx } = this
    const result = await ctx.app.model.query('SELECT COUNT(*) FROM user_account_info WHERE user_id = ? AND password = ?',
      { replacements: [ user_id, password ], type: ctx.app.Sequelize.QueryTypes.SELECT })
    if (result[0]['COUNT(*)'] === 0) throw (new Error('用户名或者密码错误'))
    const skey = ctx.helper.creat_uuid()
    ctx.app.model.query('INSERT INTO user_login_state(user_id,skey) VALUES(?,?)',
      { replacements: [ user_id, skey ], type: ctx.app.Sequelize.INSERT })
    return skey
  }
}

module.exports = UserService
