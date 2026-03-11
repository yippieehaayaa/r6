export class CategoryNotFoundError extends Error {
  constructor(message = "Category not found") {
    super(message);
    this.name = "CategoryNotFoundError";
    Object.setPrototypeOf(this, CategoryNotFoundError.prototype);
  }
}

export class ParentCategoryNotFoundError extends Error {
  constructor(message = "Parent category not found") {
    super(message);
    this.name = "ParentCategoryNotFoundError";
    Object.setPrototypeOf(this, ParentCategoryNotFoundError.prototype);
  }
}

export class CategorySlugExistsError extends Error {
  constructor(message = "Category slug already exists") {
    super(message);
    this.name = "CategorySlugExistsError";
    Object.setPrototypeOf(this, CategorySlugExistsError.prototype);
  }
}

export class CategoryHasProductsError extends Error {
  constructor(message = "Category has assigned products") {
    super(message);
    this.name = "CategoryHasProductsError";
    Object.setPrototypeOf(this, CategoryHasProductsError.prototype);
  }
}

export class CategoryHasChildrenError extends Error {
  constructor(message = "Category has child categories") {
    super(message);
    this.name = "CategoryHasChildrenError";
    Object.setPrototypeOf(this, CategoryHasChildrenError.prototype);
  }
}

export class BrandNotFoundError extends Error {
  constructor(message = "Brand not found") {
    super(message);
    this.name = "BrandNotFoundError";
    Object.setPrototypeOf(this, BrandNotFoundError.prototype);
  }
}

export class BrandNameExistsError extends Error {
  constructor(message = "Brand name already exists") {
    super(message);
    this.name = "BrandNameExistsError";
    Object.setPrototypeOf(this, BrandNameExistsError.prototype);
  }
}

export class BrandSlugExistsError extends Error {
  constructor(message = "Brand slug already exists") {
    super(message);
    this.name = "BrandSlugExistsError";
    Object.setPrototypeOf(this, BrandSlugExistsError.prototype);
  }
}

export class BrandHasProductsError extends Error {
  constructor(message = "Brand has assigned products") {
    super(message);
    this.name = "BrandHasProductsError";
    Object.setPrototypeOf(this, BrandHasProductsError.prototype);
  }
}

export class ProductNotFoundError extends Error {
  constructor(message = "Product not found") {
    super(message);
    this.name = "ProductNotFoundError";
    Object.setPrototypeOf(this, ProductNotFoundError.prototype);
  }
}

export class ProductSkuExistsError extends Error {
  constructor(message = "Product SKU already exists") {
    super(message);
    this.name = "ProductSkuExistsError";
    Object.setPrototypeOf(this, ProductSkuExistsError.prototype);
  }
}

export class ProductSlugExistsError extends Error {
  constructor(message = "Product slug already exists") {
    super(message);
    this.name = "ProductSlugExistsError";
    Object.setPrototypeOf(this, ProductSlugExistsError.prototype);
  }
}

export class ProductInvalidStatusTransitionError extends Error {
  constructor(message = "Invalid product status transition") {
    super(message);
    this.name = "ProductInvalidStatusTransitionError";
    Object.setPrototypeOf(this, ProductInvalidStatusTransitionError.prototype);
  }
}

export class ProductVariantNotFoundError extends Error {
  constructor(message = "Product variant not found") {
    super(message);
    this.name = "ProductVariantNotFoundError";
    Object.setPrototypeOf(this, ProductVariantNotFoundError.prototype);
  }
}

export class ProductVariantSkuExistsError extends Error {
  constructor(message = "Product variant SKU already exists") {
    super(message);
    this.name = "ProductVariantSkuExistsError";
    Object.setPrototypeOf(this, ProductVariantSkuExistsError.prototype);
  }
}

export class InventoryItemNotFoundError extends Error {
  constructor(message = "Inventory item not found") {
    super(message);
    this.name = "InventoryItemNotFoundError";
    Object.setPrototypeOf(this, InventoryItemNotFoundError.prototype);
  }
}

export class InsufficientStockError extends Error {
  constructor(message = "Insufficient stock available") {
    super(message);
    this.name = "InsufficientStockError";
    Object.setPrototypeOf(this, InsufficientStockError.prototype);
  }
}

export class InvalidReservationError extends Error {
  constructor(message = "Cannot release more than the reserved quantity") {
    super(message);
    this.name = "InvalidReservationError";
    Object.setPrototypeOf(this, InvalidReservationError.prototype);
  }
}
