const Joi = require('joi')

const markAttendanceSchema = Joi.object({
  employee_id: Joi.string().uuid().required().messages({
    'string.guid': 'Employee ID must be a valid UUID',
    'any.required': 'Employee ID is required',
  }),
  date: Joi.string().isoDate().required().messages({
    'string.isoDate': 'Date must be a valid date (YYYY-MM-DD)',
    'any.required': 'Date is required',
  }),
  status: Joi.string()
    .valid('present', 'absent', 'half_day', 'leave')
    .required()
    .messages({
      'any.only': 'Status must be one of: present, absent, half_day, leave',
      'any.required': 'Status is required',
    }),
  notes: Joi.string().max(300).allow('', null),
})

// Bulk mark — single date, array of employee statuses
const bulkMarkAttendanceSchema = Joi.object({
  date: Joi.string().isoDate().required().messages({
    'string.isoDate': 'Date must be a valid date (YYYY-MM-DD)',
    'any.required': 'Date is required',
  }),
  records: Joi.array()
    .items(
      Joi.object({
        employee_id: Joi.string().uuid().required().messages({
          'string.guid': 'Employee ID must be a valid UUID',
          'any.required': 'Employee ID is required',
        }),
        status: Joi.string()
          .valid('present', 'absent', 'half_day', 'leave')
          .required()
          .messages({
            'any.only': 'Status must be one of: present, absent, half_day, leave',
            'any.required': 'Status is required',
          }),
        notes: Joi.string().max(300).allow('', null),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one attendance record is required',
      'any.required': 'Records are required',
    }),
})

const updateAttendanceSchema = Joi.object({
  status: Joi.string()
    .valid('present', 'absent', 'half_day', 'leave')
    .required()
    .messages({
      'any.only': 'Status must be one of: present, absent, half_day, leave',
      'any.required': 'Status is required',
    }),
  notes: Joi.string().max(300).allow('', null),
})

const monthYearSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required().messages({
    'number.min': 'Month must be between 1 and 12',
    'number.max': 'Month must be between 1 and 12',
    'any.required': 'Month is required',
  }),
  year: Joi.number()
    .integer()
    .min(2020)
    .max(2100)
    .required()
    .messages({
      'number.min': 'Year must be 2020 or later',
      'any.required': 'Year is required',
    }),
  employee_id: Joi.string().uuid().allow('', null),
  department: Joi.string().allow('', null),
})

module.exports = {
  markAttendanceSchema,
  bulkMarkAttendanceSchema,
  updateAttendanceSchema,
  monthYearSchema,
}