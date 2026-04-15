const chargeTypesService = require('./chargeTypes.service')
const { createChargeTypeSchema, updateChargeTypeSchema } = require('./chargeTypes.validation')
const { success, error } = require('../../utils/response')
const CHARGE_TYPE_MESSAGES = require('./chargeTypes.constants')

const getAllChargeTypes = async (req, res, next) => {
  try {
    const activeOnly = req.query.active === 'true'
    const types = await chargeTypesService.getAllChargeTypes(activeOnly)
    return success(res, types, CHARGE_TYPE_MESSAGES.FETCHED)
  } catch (err) {
    next(err)
  }
}

const getChargeTypeById = async (req, res, next) => {
  try {
    const type = await chargeTypesService.getChargeTypeById(req.params.id)
    return success(res, type, CHARGE_TYPE_MESSAGES.SINGLE_FETCHED)
  } catch (err) {
    next(err)
  }
}

const createChargeType = async (req, res, next) => {
  try {
    const { error: validationError } = createChargeTypeSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }
    const type = await chargeTypesService.createChargeType(req.body.name)
    return success(res, type, CHARGE_TYPE_MESSAGES.CREATED, 201)
  } catch (err) {
    next(err)
  }
}

const updateChargeType = async (req, res, next) => {
  try {
    const { error: validationError } = updateChargeTypeSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }
    const type = await chargeTypesService.updateChargeType(req.params.id, req.body)
    return success(res, type, CHARGE_TYPE_MESSAGES.UPDATED)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllChargeTypes,
  getChargeTypeById,
  createChargeType,
  updateChargeType,
}