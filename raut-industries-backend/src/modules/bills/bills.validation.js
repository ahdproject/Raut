const Joi = require('joi')

const lineItemSchema = Joi.object({
  product_id: Joi.string().uuid().required().messages({
    'string.guid': 'Product ID must be a valid UUID',
    'any.required': 'Product ID is required for each line item',
  }),
  description: Joi.string().max(500).allow('', null),
  qty: Joi.number().positive().required().messages({
    'number.positive': 'Quantity must be greater than zero',
    'any.required': 'Quantity is required for each line item',
  }),
  rate: Joi.number().min(0).required().messages({
    'number.min': 'Rate cannot be negative',
    'any.required': 'Rate is required for each line item',
  }),
  sort_order: Joi.number().integer().min(1).default(1),
})

const otherChargeSchema = Joi.object({
  charge_type_id: Joi.string().uuid().allow(null).messages({
    'string.guid': 'Charge type ID must be a valid UUID',
  }),
  custom_name: Joi.string().max(100).allow('', null),
  qty: Joi.number().positive().required().messages({
    'number.positive': 'Quantity must be greater than zero',
    'any.required': 'Quantity is required for each charge',
  }),
  rate: Joi.number().min(0).required().messages({
    'number.min': 'Rate cannot be negative',
    'any.required': 'Rate is required for each charge',
  }),
  sort_order: Joi.number().integer().min(1).default(1),
})

const createBillSchema = Joi.object({
  bill_date: Joi.string().isoDate().required().messages({
    'string.isoDate': 'Bill date must be a valid date (YYYY-MM-DD)',
    'any.required': 'Bill date is required',
  }),
  client_id: Joi.string().uuid().required().messages({
    'string.guid': 'Client ID must be a valid UUID',
    'any.required': 'Client is required',
  }),
  transport_mode: Joi.string().max(50).allow('', null),
  vehicle_number: Joi.string().max(30).allow('', null),
  place_of_supply: Joi.string().max(100).allow('', null),
  ref_number: Joi.string().max(100).allow('', null),
  payment_terms: Joi.string().max(50).allow('', null),
  notes: Joi.string().max(1000).allow('', null),
  line_items: Joi.array().items(lineItemSchema).min(1).required().messages({
    'array.min': 'At least one line item is required',
    'any.required': 'Line items are required',
  }),
  other_charges: Joi.array().items(otherChargeSchema).default([]),
})

const updateBillSchema = Joi.object({
  bill_date: Joi.string().isoDate().messages({
    'string.isoDate': 'Bill date must be a valid date (YYYY-MM-DD)',
  }),
  client_id: Joi.string().uuid().messages({
    'string.guid': 'Client ID must be a valid UUID',
  }),
  transport_mode: Joi.string().max(50).allow('', null),
  vehicle_number: Joi.string().max(30).allow('', null),
  place_of_supply: Joi.string().max(100).allow('', null),
  ref_number: Joi.string().max(100).allow('', null),
  payment_terms: Joi.string().max(50).allow('', null),
  notes: Joi.string().max(1000).allow('', null),
  line_items: Joi.array().items(lineItemSchema).min(1).messages({
    'array.min': 'At least one line item is required',
  }),
  other_charges: Joi.array().items(otherChargeSchema),
})

const previewBillSchema = Joi.object({
  client_id: Joi.string().uuid().required().messages({
    'string.guid': 'Client ID must be a valid UUID',
    'any.required': 'Client ID is required for preview',
  }),
  line_items: Joi.array().items(lineItemSchema).min(1).required().messages({
    'array.min': 'At least one line item is required',
    'any.required': 'Line items are required',
  }),
  other_charges: Joi.array().items(otherChargeSchema).default([]),
})

module.exports = {
  createBillSchema,
  updateBillSchema,
  previewBillSchema,
}