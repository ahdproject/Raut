const productsRepository = require('./products.repository')
const gstSlabsRepository = require('../gst-slabs/gstSlabs.repository')
const { PRODUCT_MESSAGES } = require('./products.constants')

const getAllProducts = async ({ search = '', activeOnly = false } = {}) => {
  return await productsRepository.findAll({ search, activeOnly })
}

const getProductById = async (id) => {
  const product = await productsRepository.findById(id)
  if (!product) {
    throw { statusCode: 404, message: PRODUCT_MESSAGES.NOT_FOUND }
  }
  return product
}

const createProduct = async (data) => {
  // Check duplicate name
  const existing = await productsRepository.findByName(data.name)
  if (existing) {
    throw { statusCode: 409, message: PRODUCT_MESSAGES.NAME_EXISTS }
  }

  // Validate GST slab exists and is active
  const gstSlab = await gstSlabsRepository.findById(data.gst_slab_id)
  if (!gstSlab || !gstSlab.is_active) {
    throw { statusCode: 400, message: PRODUCT_MESSAGES.GST_SLAB_NOT_FOUND }
  }

  return await productsRepository.create(data)
}

const updateProduct = async (id, fields) => {
  // Check product exists
  const existing = await productsRepository.findById(id)
  if (!existing) {
    throw { statusCode: 404, message: PRODUCT_MESSAGES.NOT_FOUND }
  }

  // Check name conflict only if name is being changed
  if (fields.name && fields.name.toLowerCase() !== existing.name.toLowerCase()) {
    const nameTaken = await productsRepository.findByName(fields.name)
    if (nameTaken) {
      throw { statusCode: 409, message: PRODUCT_MESSAGES.NAME_EXISTS }
    }
  }

  // Validate new GST slab if being changed
  if (fields.gst_slab_id) {
    const gstSlab = await gstSlabsRepository.findById(fields.gst_slab_id)
    if (!gstSlab || !gstSlab.is_active) {
      throw { statusCode: 400, message: PRODUCT_MESSAGES.GST_SLAB_NOT_FOUND }
    }
  }

  // Prevent deactivation if product is linked to bills
  if (fields.is_active === false) {
    const linked = await productsRepository.isLinkedToBills(id)
    if (linked) {
      throw { statusCode: 400, message: PRODUCT_MESSAGES.CANNOT_DEACTIVATE }
    }
  }

  return await productsRepository.update(id, fields)
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
}