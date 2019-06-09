'use strict'

module.exports = options => {
  return async function loginStateAuth(ctx, next) {
    const skey = ctx.cookies.get('skey')
    // 数据库中是否有用户skey
    const result = await ctx.app.model.query('SELECT * FROM user_login_state WHERE skey = ?',
      { replacements: [ skey ], type: ctx.app.Sequelize.SELECT })
    if (result[0].length === 0) throw (new Error('找不到用户的skey！'))
    ctx.user_id = result[0][0].user_id

    // skey有效
    await next()
  }
}
