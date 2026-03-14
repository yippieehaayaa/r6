import {
  ConflictError,
  NotFoundError,
  UnprocessableError,
} from "../../shared/errors";

export class InventoryItemNotFoundError extends NotFoundError {
  constructor(message = "Inventory item not found") {
    super(message);
  }
}

export class InsufficientStockError extends UnprocessableError {
  constructor(message = "Insufficient stock available") {
    super(message);
  }
}

export class InvalidReservationError extends UnprocessableError {
  constructor(message = "Cannot release more than the reserved quantity") {
    super(message);
  }
}

export class WarehouseNotFoundError extends NotFoundError {
  constructor(message = "Warehouse not found") {
    super(message);
  }
}

export class WarehouseNameExistsError extends ConflictError {
  constructor(message = "Warehouse name already exists") {
    super(message);
  }
}

export class WarehouseCodeExistsError extends ConflictError {
  constructor(message = "Warehouse code already exists") {
    super(message);
  }
}

export class WarehouseHasInventoryError extends ConflictError {
  constructor(message = "Warehouse has active inventory items") {
    super(message);
  }
}
