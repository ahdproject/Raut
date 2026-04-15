const gstSlabsRepository = require('./gstSlabs.repository')
const GST_MESSAGES = require('./gstSlabs.constants')

const getAllGstSlabs = async (activeOnly = false) => {
  return await gstSlabsRepository.findAll(activeOnly)
}

const getGstSlabById = async (id) => {
  const slab = await gstSlabsRepository.findById(id)
  if (!slab) {
    throw { statusCode: 404, message: GST_MESSAGES.NOT_FOUND }
  }
  return slab
}

const createGstSlab = async (data) => {
  const existing = await gstSlabsRepository.findByLabel(data.label)
  if (existing) {
    throw { statusCode: 409, message: GST_MESSAGES.LABEL_EXISTS }
  }
  return await gstSlabsRepository.create(data)
}

const updateGstSlab = async (id, fields) => {
  const existing = await gstSlabsRepository.findById(id)
  if (!existing) {
    throw { statusCode: 404, message: GST_MESSAGES.NOT_FOUND }
  }

  if (fields.label && fields.label !== existing.label) {
    const labelTaken = await gstSlabsRepository.findByLabel(fields.label)
    if (labelTaken) {
      throw { statusCode: 409, message: GST_MESSAGES.LABEL_EXISTS }
    }
  }

  if (fields.is_active === false) {
    const linked = await gstSlabsRepository.isLinkedToProducts(id)
    if (linked) {
      throw { statusCode: 400, message: GST_MESSAGES.CANNOT_DELETE }
    }
  }

  return await gstSlabsRepository.update(id, fields)
}

module.exports = {
  getAllGstSlabs,
  getGstSlabById,
  createGstSlab,
  updateGstSlab,
}