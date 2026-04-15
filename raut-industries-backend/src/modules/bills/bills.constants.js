const BILL_MESSAGES = {
  CREATED: 'Bill created successfully',
  UPDATED: 'Bill updated successfully',
  CONFIRMED: 'Bill confirmed successfully',
  CANCELLED: 'Bill cancelled successfully',
  FETCHED: 'Bills fetched successfully',
  SINGLE_FETCHED: 'Bill fetched successfully',
  PREVIEW_SUCCESS: 'Bill preview calculated successfully',
  NEXT_NUMBER_FETCHED: 'Next bill number fetched successfully',
  NOT_FOUND: 'Bill not found',
  CLIENT_NOT_FOUND: 'Selected client does not exist or is inactive',
  PRODUCT_NOT_FOUND: 'Product not found or inactive',
  CHARGE_TYPE_NOT_FOUND: 'Charge type not found or inactive',
  NO_LINE_ITEMS: 'At least one line item is required',
  CANNOT_EDIT_CONFIRMED: 'Confirmed bills cannot be edited',
  CANNOT_EDIT_CANCELLED: 'Cancelled bills cannot be edited',
  ALREADY_CONFIRMED: 'Bill is already confirmed',
  ALREADY_CANCELLED: 'Bill is already cancelled',
  CANNOT_CONFIRM_CANCELLED: 'A cancelled bill cannot be confirmed',
  ONLY_ADMIN_CANCEL: 'Only Admin or SuperAdmin can cancel a confirmed bill',
  INVALID_QTY: 'Quantity must be greater than zero',
  INVALID_RATE: 'Rate must be greater than or equal to zero',
  EITHER_CHARGE_TYPE_OR_CUSTOM: 'Each other charge must have either a charge_type_id or a custom_name',
}

const BILL_STATUS = {
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
}

module.exports = { BILL_MESSAGES, BILL_STATUS }