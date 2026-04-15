const PRODUCT_MESSAGES = {
  CREATED: 'Product created successfully',
  UPDATED: 'Product updated successfully',
  FETCHED: 'Products fetched successfully',
  SINGLE_FETCHED: 'Product fetched successfully',
  NOT_FOUND: 'Product not found',
  GST_SLAB_NOT_FOUND: 'Selected GST slab does not exist or is inactive',
  NAME_EXISTS: 'A product with this name already exists',
  CANNOT_DEACTIVATE: 'This product is linked to existing bills and cannot be deactivated',
  INVALID_UNIT: 'Unit must be one of: nos, kgs, ltr, sqft, mtr, box',
}

const ALLOWED_UNITS = ['nos', 'kgs', 'ltr', 'sqft', 'mtr', 'box']

module.exports = { PRODUCT_MESSAGES, ALLOWED_UNITS }