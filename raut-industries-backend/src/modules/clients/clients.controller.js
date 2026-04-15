const clientsService = require('./clients.service')
const { createClientSchema, updateClientSchema } = require('./clients.validation')
const { success, error } = require('../../utils/response')
const CLIENT_MESSAGES = require('./clients.constants')

const getAllClients = async (req, res, next) => {
  try {
    const search = req.query.search || ''
    const clients = await clientsService.getAllClients(search)
    return success(res, clients, CLIENT_MESSAGES.FETCHED)
  } catch (err) {
    next(err)
  }
}

const getClientById = async (req, res, next) => {
  try {
    const client = await clientsService.getClientById(req.params.id)
    return success(res, client, CLIENT_MESSAGES.SINGLE_FETCHED)
  } catch (err) {
    next(err)
  }
}

const createClient = async (req, res, next) => {
  try {
    const { error: validationError } = createClientSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }
    const client = await clientsService.createClient(req.body)
    return success(res, client, CLIENT_MESSAGES.CREATED, 201)
  } catch (err) {
    next(err)
  }
}

const updateClient = async (req, res, next) => {
  try {
    const { error: validationError } = updateClientSchema.validate(req.body)
    if (validationError) {
      return error(res, validationError.details[0].message, 400)
    }
    const client = await clientsService.updateClient(req.params.id, req.body)
    return success(res, client, CLIENT_MESSAGES.UPDATED)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
}