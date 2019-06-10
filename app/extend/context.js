'use strict'

module.exports = {
  validate(rule, value) {
    const err = this.app.validator.validate(rule, value)
    if (err) throw (new Error(err[0].message))
  }
}
