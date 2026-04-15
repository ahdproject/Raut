const Joi = require('joi')
const { ALLOWED_UNITS } = require('./products.constants')

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Product name must be at least 2 characters',
    'string.max': 'Product name cannot exceed 200 characters',
    'any.required': 'Product name is required',
  }),
  description: Joi.string().max(1000).allow('', null).messages({
    'string.max': 'Description cannot exceed 1000 characters',
  }),
  hsn_code: Joi.string().min(4).max(20).required().messages({
    'string.min': 'HSN code must be at least 4 characters',
    'string.max': 'HSN code cannot exceed 20 characters',
    'any.required': 'HSN code is required',
  }),
  unit: Joi.string().valid(...ALLOWED_UNITS).required().messages({
    'any.only': `Unit must be one of: ${ALLOWED_UNITS.join(', ')}`,
    'any.required': 'Unit is required',
  }),
  default_rate: Joi.number().min(0).required().messages({
    'number.min': 'Default rate cannot be negative',
    'any.required': 'Default rate is required',
  }),
  gst_slab_id: Joi.string().uuid().required().messages({
    'string.guid': 'GST slab ID must be a valid UUID',
    'any.required': 'GST slab is required',
  }),
})

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).messages({
    'string.min': 'Product name must be at least 2 characters',
    'string.max': 'Product name cannot exceed 200 characters',
  }),
  description: Joi.string().max(1000).allow('', null).messages({
    'string.max': 'Description cannot exceed 1000 characters',
  }),
  hsn_code: Joi.string().min(4).max(20).messages({
    'string.min': 'HSN code must be at least 4 characters',
    'string.max': 'HSN code cannot exceed 20 characters',
  }),
  unit: Joi.string().valid(...ALLOWED_UNITS).messages({
    'any.only': `Unit must be one of: ${ALLOWED_UNITS.join(', ')}`,
  }),
  default_rate: Joi.number().min(0).messages({
    'number.min': 'Default rate cannot be negative',
  }),
  gst_slab_id: Joi.string().uuid().messages({
    'string.guid': 'GST slab ID must be a valid UUID',
  }),
  is_active: Joi.boolean(),
})

module.exports = { createProductSchema, updateProductSchema }