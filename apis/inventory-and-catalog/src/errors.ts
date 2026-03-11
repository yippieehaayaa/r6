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
