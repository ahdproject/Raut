const productsService = require('./products.service')
const { createProductSchema, updateProductSchema } = require('./products.validation')
const { success, error } = require('../../utils/response')
const { PRODUCT_MESSAGES } = require('./products.constants')

const getAllProducts = async (req, res, next) => {
  try {
    const search = req.query.search || ''
    const activeOnly = req.query.active === 'true'
    const products = await productsService.getAllProducts({ search, activeOnly })
    return success(res, products, PRODUCT_MESSAGES.FETCHED)
  } catch (err) {
    next(err)
  }
}

const getProductById = async (req, res, next) => {
  try {
    const product = await productsService.getProductById(req.params.id)
    return success(res, product, PRODUCT_MESSAGES.SINGLE_FETCHED)
  } catch (err) {
    next(err)
  }
}

const createProduct = async (req, res, next) => {
  try {
    const { error: validationError } = createProductSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }

    const product = await productsService.createProduct(req.body)
    return success(res, product, PRODUCT_MESSAGES.CREATED, 201)
  } catch (err) {
    next(err)
  }
}

const updateProduct = async (req, res, next) => {
  try {
    const { error: validationError } = updateProductSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }

    const product = await productsService.updateProduct(req.params.id, req.body)
    return success(res, product, PRODUCT_MESSAGES.UPDATED)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
}