const Joi = require('joi')

const createClientSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().messages({
    'string.min': 'Client name must be at least 2 characters',
    'any.required': 'Client name is required',
  }),
  address: Joi.string().allow('', null),
  gstin: Joi.string().length(15).allow('', null).messages({
    'string.length': 'GSTIN must be exactly 15 characters',
  }),
  state_code: Joi.string().length(2).required().messages({
    'string.length': 'State code must be 2 characters',
    'any.required': 'State code is required',
  }),
  phone: Joi.string().min(10).max(15).allow('', null).messages({
    'string.min': 'Phone number must be at least 10 digits',
  }),
})

const updateClientSchema = Joi.object({
  name: Joi.string().min(2).max(150).messages({
    'string.min': 'Client name must be at least 2 characters',
  }),
  address: Joi.string().allow('', null),
  gstin: Joi.string().length(15).allow('', null).messages({
    'string.length': 'GSTIN must be exactly 15 characters',
  }),
  state_code: Joi.string().length(2).messages({
    'string.length': 'State code must be 2 characters',
  }),
  phone: Joi.string().min(10).max(15).allow('', null).messages({
    'string.min': 'Phone number must be at least 10 digits',
  }),
  is_active: Joi.boolean(),
})

module.exports = { createClientSchema, updateClientSchema }