const chargeTypesRepository = require('./chargeTypes.repository')
const CHARGE_TYPE_MESSAGES = require('./chargeTypes.constants')

const getAllChargeTypes = async (activeOnly = false) => {
  return await chargeTypesRepository.findAll(activeOnly)
}

const getChargeTypeById = async (id) => {
  const chargeType = await chargeTypesRepository.findById(id)
  if (!chargeType) {
    throw { statusCode: 404, message: CHARGE_TYPE_MESSAGES.NOT_FOUND }
  }
  return chargeType
}

const createChargeType = async (name) => {
  const existing = await chargeTypesRepository.findByName(name)
  if (existing) {
    throw { statusCode: 409, message: CHARGE_TYPE_MESSAGES.NAME_EXISTS }
  }
  return await chargeTypesRepository.create(name)
}

const updateChargeType = async (id, fields) => {
  const existing = await chargeTypesRepository.findById(id)
  if (!existing) {
    throw { statusCode: 404, message: CHARGE_TYPE_MESSAGES.NOT_FOUND }
  }

  if (fields.name && fields.name !== existing.name) {
    const nameTaken = await chargeTypesRepository.findByName(fields.name)
    if (nameTaken) {
      throw { statusCode: 409, message: CHARGE_TYPE_MESSAGES.NAME_EXISTS }
    }
  }

  if (fields.is_active === false) {
    const linked = await chargeTypesRepository.isLinkedToBills(id)
    if (linked) {
      throw { statusCode: 400, message: CHARGE_TYPE_MESSAGES.CANNOT_DEACTIVATE }
    }
  }

  return await chargeTypesRepository.update(id, fields)
}

module.exports = {
  getAllChargeTypes,
  getChargeTypeById,
  createChargeType,
  updateChargeType,
}