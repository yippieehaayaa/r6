import {
  ConflictError,
  NotFoundError,
  UnprocessableError,
} from "../../shared/errors";

export class SupplierNotFoundError extends NotFoundError {
  constructor(message = "Supplier not found") {
    super(message);
  }
}

export class SupplierNameExistsError extends ConflictError {
  constructor(message = "Supplier name already exists") {
    super(message);
  }
}

export class SupplierCodeExistsError extends ConflictError {
  constructor(message = "Supplier code already exists") {
    super(message);
  }
}

export class SupplierHasOrdersError extends ConflictError {
  constructor(message = "Supplier has active purchase orders") {
    super(message);
  }
}

export class PurchaseOrderNotFoundError extends NotFoundError {
  constructor(message = "Purchase order not found") {
    super(message);
  }
}

export class PurchaseOrderNumberExistsError extends ConflictError {
  constructor(message = "Purchase order number already exists") {
    super(message);
  }
}

export class PurchaseOrderInvalidStatusTransitionError extends UnprocessableError {
  constructor(message = "Invalid purchase order status transition") {
    super(message);
  }
}

export class PurchaseOrderItemNotFoundError extends NotFoundError {
  constructor(message = "Purchase order item not found") {
    super(message);
  }
}

export class PurchaseOrderItemDuplicateVariantError extends ConflictError {
  constructor(message = "Variant already exists in this purchase order") {
    super(message);
  }
}
