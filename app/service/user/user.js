'use strict'

const Service = require('egg').Service

class UserService extends Service {

  async validateNewUserInfo(user_id, verify_user_id, id_card) {
    const { ctx } = this
    // 检测数据库是否已存在该用户
    let result = await ctx.app.model.query('SELECT COUNT(*) FROM user_name WHERE user_id = ?',
      { replacements: [ user_id ], type: ctx.app.Sequelize.QueryTypes.SELECT })
    if (result[0]['COUNT(*)'] !== 0) throw (new Error('已存在该名用户'))
    // 检测审核人是否存在
    result = await ctx.app.model.query('SELECT COUNT(*) FROM user_name WHERE user_id = ?',
      { replacements: [ verify_user_id ], type: ctx.app.Sequelize.QueryTypes.SELECT })
    if (result[0]['COUNT(*)'] === 0) throw (new Error('审核人不存在'))
    // 检测身份证正确性
    result = await ctx.app.model.query('SELECT COUNT(*) FROM user_account_info WHERE id_card = ?',
      { replacements: [ id_card ], type: ctx.app.Sequelize.QueryTypes.SELECT })
    if (result[0]['COUNT(*)'] !== 0) throw (new Error('身份证输入有误'))
  }

  async creatNewUserInDb(user_id, password, name, id_card) {
    const { ctx } = this
    ctx.app.model.query('INSERT INTO user_name(user_id,name) VALUES(?,?)',
      { replacements: [ user_id, name ], type: ctx.app.Sequelize.QueryTypes.INSERT })
    ctx.app.model.query('INSERT INTO user_optional_info(user_id) VALUES(?)',
      { replacements: [ user_id ], type: ctx.app.Sequelize.QueryTypes.INSERT })
    ctx.app.model.query('INSERT INTO user_account_info(user_id,password,id_card,permission) VALUES(?,?,?,?)',
      { replacements: [ user_id, password, id_card, 1 ], type: ctx.app.Sequelize.QueryTypes.INSERT })
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
  async getReviewFromDb(user_id) {
    const { ctx } = this
    const result = await ctx.app.model.query('SELECT passive_user_id,relation FROM insert_event WHERE subject_user_id = ?',
      { replacements: [ user_id ], type: ctx.app.Sequelize.SELECT })
    return result[0]
  }
  async insertEventHandler(subject_user_id, passive_user_id, confirm_state, relation) {
    const { ctx } = this
    // 不管审核员是否同意，都将从insert_event中删除这个事件
    await ctx.app.model.query('DELETE FROM insert_event WHERE subject_user_id = ? AND passive_user_id = ?',
      { replacements: [ subject_user_id, passive_user_id ], type: ctx.app.Sequelize.DELETE })
    if (confirm_state) {
      // 审核员同意新增成员请求
      await this.insertIntoTree(subject_user_id, passive_user_id, relation)
    }
  }
  async insertIntoTree(subject_user_id, passive_user_id, relation) {
    const { ctx } = this
    switch (relation) {
      case 1 : await ctx.app.model.query('CALL insertByFather(?,?)',
        { replacements: [ subject_user_id, passive_user_id ] })
        break
      case 2 : await ctx.app.model.query('CALL insertByBrother(?,?)',
        { replacements: [ subject_user_id, passive_user_id ] })
        break
      default: throw (new Error('[在家族树中新增节点]发生未知错误'))
    }
  }
  async getTreeNodesFromDb() {
    const { ctx } = this
    const result = await ctx.app.model.query('SELECT user_node_id AS id,parent_node_id AS parent_id,name FROM family_tree,user_name WHERE family_tree.user_node_id = user_name.user_id',
      { type: ctx.app.Sequelize.SELECT })
    const list = result[0]
    // 组装数据
    let node
    const map = {}
    const tree = []
    let i
    for (i = 0; i < list.length; i++) {
      map[list[i].id] = list[i]
      list[i].children = []
    }
    for (i = 0; i < list.length; i += 1) {
      node = list[i]
      if (node.parent_id !== '-1') {
        map[node.parent_id].children.push(node)
      } else {
        tree.push(node)
      }
    }
    return tree
  }
  async getPermission(user_id) {
    const { ctx } = this
    const result = await ctx.app.model.query('SELECT permission FROM user_account_info WHERE user_id = ?',
      { replacements: [ user_id ], type: ctx.app.Sequelize.SELECT })
    return result[0][0].permission
  }
  async deleteFromTree(user_id) {
    const { ctx } = this
    await ctx.app.model.query('CALL deleteNode(?)',
      { replacements: [ user_id ] }
    )
  }
  async validateTreeId(user_id) {
    const { ctx } = this
    const result = await ctx.app.model.query('SELECT COUNT(*) FROM family_tree WHERE user_node_id = ?',
      { replacements: [ user_id ], type: ctx.app.Sequelize.SELECT })
    if (result[0][0]['COUNT(*)'] === 0) throw (new Error('家族树中不存在该用户id'))
  }
  async editUserInfoInDb(user_id, info) {
    const { ctx } = this
    const result = await ctx.app.model.query('SELECT * FROM user_optional_info WHERE user_id = ?',
      { replacements: [ user_id ], type: ctx.app.Sequelize.SELECT })
    const dbObj = result[0][0]

    const newObj = {}
    for (const key in dbObj) {
      if (info[key] === undefined) {
        newObj[key] = dbObj[key]
      } else {
        newObj[key] = info[key]
      }
    }

    await ctx.app.model.query('INSERT INTO user_optional_info(user_id,home_location,work,work_location,tele,qq,email,interest,avatar,gender,country,birthday) VALUES(:user_id,:home_location,:work,:work_location,:tele,:qq,:email,:interest,:avatar,:gender,:country,:birthday) ON DUPLICATE KEY UPDATE home_location = :home_location,work = :work,work_location = :work_location,tele = :tele,qq = :qq,email = :email,interest = :interest,avatar = :avatar, gender = :gender,country = :country,birthday = :birthday',
      { replacements: { ...newObj, user_id }, type: ctx.app.Sequelize.UPDATE })
  }
  async findUser(user_id) {
    const { ctx } = this
    const result = await ctx.app.model.query('SELECT COUNT(*) FROM user_account_info WHERE user_id = ?',
      { replacements: [ user_id ], type: ctx.app.Sequelize.SELECT })
    switch (result[0][0]['COUNT(*)']) {
      case 0 : return false
      case 1 : return true
      default:
        throw (new Error('未知错误'))
    }
  }
  async getUserPermission(user_id) {
    const { ctx } = this
    const result = await ctx.app.model.query('SELECT permission FROM user_account_info WHERE user_id = ?',
      { replacements: [ user_id ], type: ctx.app.Sequelize.SELECT })
    switch (result[0][0].permission) {
      case 2 : return false
      case 1 : return true
      default:
        throw (new Error('未知错误'))
    }
  }
  async offerAdmin(employee_id) {
    const { ctx } = this
    await ctx.app.model.query('UPDATE user_account_info SET permission = 2 WHERE user_id = ?',
      { replacements: [ employee_id ], type: ctx.app.Sequelize.UPDATE })
  }
  async dismissAdmin(admin_id) {
    const { ctx } = this
    await ctx.app.model.query('UPDATE user_account_info SET permission = 1 WHERE user_id = ?',
      { replacements: [ admin_id ], type: ctx.app.Sequelize.UPDATE })
  }
  async addPost(user_id, title, content) {
    const { ctx } = this
    await ctx.app.model.query('INSERT INTO poster(user_id,poster_title,poster_content,created_at) VALUES(?,?,?,now())',
      { replacements: [ user_id, title, content ], type: ctx.app.Sequelize.INSERT })
  }
  async deletePost(user_id, poster_id) {
    // todo 加个删除失败的抛错（安全防范措施）
    const { ctx } = this
    await ctx.app.model.query('DELETE FROM poster WHERE poster_id = ? AND user_id = ?',
      { replacements: [ poster_id, user_id ], type: ctx.app.Sequelize.DELETE })
  }
}

module.exports = UserService
