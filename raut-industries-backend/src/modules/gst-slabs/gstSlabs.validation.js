const Joi = require('joi')

const createGstSlabSchema = Joi.object({
  label: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Label must be at least 2 characters',
    'any.required': 'Label is required',
  }),
  cgst_rate: Joi.number().min(0).max(100).required().messages({
    'number.min': 'CGST rate cannot be negative',
    'number.max': 'CGST rate cannot exceed 100',
    'any.required': 'CGST rate is required',
  }),
  sgst_rate: Joi.number().min(0).max(100).required().messages({
    'number.min': 'SGST rate cannot be negative',
    'number.max': 'SGST rate cannot exceed 100',
    'any.required': 'SGST rate is required',
  }),
  igst_rate: Joi.number().min(0).max(100).required().messages({
    'number.min': 'IGST rate cannot be negative',
    'number.max': 'IGST rate cannot exceed 100',
    'any.required': 'IGST rate is required',
  }),
})

const updateGstSlabSchema = Joi.object({
  label: Joi.string().min(2).max(50).messages({
    'string.min': 'Label must be at least 2 characters',
  }),
  cgst_rate: Joi.number().min(0).max(100).messages({
    'number.min': 'CGST rate cannot be negative',
    'number.max': 'CGST rate cannot exceed 100',
  }),
  sgst_rate: Joi.number().min(0).max(100).messages({
    'number.min': 'SGST rate cannot be negative',
    'number.max': 'SGST rate cannot exceed 100',
  }),
  igst_rate: Joi.number().min(0).max(100).messages({
    'number.min': 'IGST rate cannot be negative',
    'number.max': 'IGST rate cannot exceed 100',
  }),
  is_active: Joi.boolean(),
})

module.exports = { createGstSlabSchema, updateGstSlabSchema }