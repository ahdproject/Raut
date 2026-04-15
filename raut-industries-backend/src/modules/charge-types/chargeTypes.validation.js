const Joi = require('joi')

const createChargeTypeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
})

const updateChargeTypeSchema = Joi.object({
  name: Joi.string().min(2).max(100).messages({
    'string.min': 'Name must be at least 2 characters',
  }),
  is_active: Joi.boolean(),
})

module.exports = { createChargeTypeSchema, updateChargeTypeSchema }