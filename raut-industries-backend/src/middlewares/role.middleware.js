const { error } = require('../utils/response')

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Unauthorized.', 401)
    }
    if (!allowedRoles.includes(req.user.role)) {
      return error(res, 'Forbidden. You do not have permission.', 403)
    }
    next()
  }
}

module.exports = authorize