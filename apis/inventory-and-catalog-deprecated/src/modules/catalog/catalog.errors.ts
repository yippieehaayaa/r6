import {
  ConflictError,
  NotFoundError,
  UnprocessableError,
} from "../../shared/errors";

export class CategoryNotFoundError extends NotFoundError {
  constructor(message = "Category not found") {
    super(message);
  }
}

export class ParentCategoryNotFoundError extends NotFoundError {
  constructor(message = "Parent category not found") {
    super(message);
  }
}

export class CategorySlugExistsError extends ConflictError {
  constructor(message = "Category slug already exists") {
    super(message);
  }
}

export class CategoryHasProductsError extends ConflictError {
  constructor(message = "Category has assigned products") {
    super(message);
  }
}

export class CategoryHasChildrenError extends ConflictError {
  constructor(message = "Category has child categories") {
    super(message);
  }
}

export class BrandNotFoundError extends NotFoundError {
  constructor(message = "Brand not found") {
    super(message);
  }
}

export class BrandNameExistsError extends ConflictError {
  constructor(message = "Brand name already exists") {
    super(message);
  }
}

export class BrandSlugExistsError extends ConflictError {
  constructor(message = "Brand slug already exists") {
    super(message);
  }
}

export class BrandHasProductsError extends ConflictError {
  constructor(message = "Brand has assigned products") {
    super(message);
  }
}

export class ProductNotFoundError extends NotFoundError {
  constructor(message = "Product not found") {
    super(message);
  }
}

export class ProductSkuExistsError extends ConflictError {
  constructor(message = "Product SKU already exists") {
    super(message);
  }
}

export class ProductSlugExistsError extends ConflictError {
  constructor(message = "Product slug already exists") {
    super(message);
  }
}

export class ProductInvalidStatusTransitionError extends UnprocessableError {
  constructor(message = "Invalid product status transition") {
    super(message);
  }
}

export class ProductVariantNotFoundError extends NotFoundError {
  constructor(message = "Product variant not found") {
    super(message);
  }
}

export class ProductVariantSkuExistsError extends ConflictError {
  constructor(message = "Product variant SKU already exists") {
    super(message);
  }
}
