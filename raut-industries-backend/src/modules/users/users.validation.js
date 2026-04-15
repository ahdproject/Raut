const Joi = require('joi')

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid('SuperAdmin', 'Admin', 'Manager').required().messages({
    'any.only': 'Role must be one of SuperAdmin, Admin, Manager',
    'any.required': 'Role is required',
  }),
})

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).messages({
    'string.min': 'Name must be at least 2 characters',
  }),
  role: Joi.string().valid('SuperAdmin', 'Admin', 'Manager').messages({
    'any.only': 'Role must be one of SuperAdmin, Admin, Manager',
  }),
  is_active: Joi.boolean(),
})

const changePasswordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  new_password: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters',
    'any.required': 'New password is required',
  }),
})

module.exports = {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
}