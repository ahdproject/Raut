const gstSlabsService = require('./gstSlabs.service')
const { createGstSlabSchema, updateGstSlabSchema } = require('./gstSlabs.validation')
const { success, error } = require('../../utils/response')
const GST_MESSAGES = require('./gstSlabs.constants')

const getAllGstSlabs = async (req, res, next) => {
  try {
    const activeOnly = req.query.active === 'true'
    const slabs = await gstSlabsService.getAllGstSlabs(activeOnly)
    return success(res, slabs, GST_MESSAGES.FETCHED)
  } catch (err) {
    next(err)
  }
}

const getGstSlabById = async (req, res, next) => {
  try {
    const slab = await gstSlabsService.getGstSlabById(req.params.id)
    return success(res, slab, GST_MESSAGES.SINGLE_FETCHED)
  } catch (err) {
    next(err)
  }
}

const createGstSlab = async (req, res, next) => {
  try {
    const { error: validationError } = createGstSlabSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }
    const slab = await gstSlabsService.createGstSlab(req.body)
    return success(res, slab, GST_MESSAGES.CREATED, 201)
  } catch (err) {
    next(err)
  }
}

const updateGstSlab = async (req, res, next) => {
  try {
    const { error: validationError } = updateGstSlabSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }
    const slab = await gstSlabsService.updateGstSlab(req.params.id, req.body)
    return success(res, slab, GST_MESSAGES.UPDATED)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllGstSlabs,
  getGstSlabById,
  createGstSlab,
  updateGstSlab,
}