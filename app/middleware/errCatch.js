'use strict'

module.exports = options => {
  return async function errCatch(ctx, next) {
    try {
      await next()
    } catch (e) {
      ctx.body = e.message
    }
  }
}
