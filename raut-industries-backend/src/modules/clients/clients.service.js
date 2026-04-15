const clientsRepository = require('./clients.repository')
const CLIENT_MESSAGES = require('./clients.constants')

const getAllClients = async (search = '') => {
  return await clientsRepository.findAll(search)
}

const getClientById = async (id) => {
  const client = await clientsRepository.findById(id)
  if (!client) {
    throw { statusCode: 404, message: CLIENT_MESSAGES.NOT_FOUND }
  }
  return client
}

const createClient = async (data) => {
  if (data.gstin) {
    const existing = await clientsRepository.findByGstin(data.gstin)
    if (existing) {
      throw { statusCode: 409, message: CLIENT_MESSAGES.GSTIN_EXISTS }
    }
  }
  return await clientsRepository.create(data)
}

const updateClient = async (id, fields) => {
  const existing = await clientsRepository.findById(id)
  if (!existing) {
    throw { statusCode: 404, message: CLIENT_MESSAGES.NOT_FOUND }
  }

  if (fields.gstin && fields.gstin !== existing.gstin) {
    const gstinTaken = await clientsRepository.findByGstin(fields.gstin)
    if (gstinTaken) {
      throw { statusCode: 409, message: CLIENT_MESSAGES.GSTIN_EXISTS }
    }
  }

  return await clientsRepository.update(id, fields)
}

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
}