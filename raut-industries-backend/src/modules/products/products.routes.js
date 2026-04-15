const express = require('express')
const router = express.Router()
const productsController = require('./products.controller')
const authenticate = require('../../middlewares/auth.middleware')
const authorize = require('../../middlewares/role.middleware')
const ROLES = require('../../constants/roles')

router.use(authenticate)

// All roles can read products (Manager needs this for bill dropdown)
router.get('/', productsController.getAllProducts)
router.get('/:id', productsController.getProductById)

// Only SuperAdmin and Admin can create or update products
router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  productsController.createProduct
)
router.put(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  productsController.updateProduct
)

module.exports = router
