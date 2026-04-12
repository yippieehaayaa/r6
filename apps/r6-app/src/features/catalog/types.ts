export type ProductStatus = "DRAFT" | "ACTIVE" | "DISCONTINUED" | "ARCHIVED";
export type TrackingType = "NONE" | "SERIAL" | "BATCH";
export type UomType = "BASE" | "PURCHASE" | "SALE";
export type DimensionUnit = "CM" | "MM" | "IN" | "FT" | "M";
export type WeightUnit = "G" | "KG" | "LB" | "OZ";

export interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string;
	parentId?: string;
	parentName?: string;
	path: string;
	sortOrder: number;
	isActive: boolean;
	productCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface Brand {
	id: string;
	name: string;
	slug: string;
	description?: string;
	logoUrl?: string;
	isActive: boolean;
	productCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface Product {
	id: string;
	sku: string;
	name: string;
	slug: string;
	description?: string;
	tags: string[];
	metadata?: Record<string, unknown>;
	status: ProductStatus;
	categoryId?: string;
	categoryName?: string;
	brandId?: string;
	brandName?: string;
	variantCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface ProductVariant {
	id: string;
	productId: string;
	sku: string;
	name: string;
	barcode?: string;
	options: Record<string, string>;
	trackingType: TrackingType;
	weight?: string;
	weightUnit?: WeightUnit;
	length?: string;
	width?: string;
	height?: string;
	dimensionUnit?: DimensionUnit;
	imageUrl?: string;
	metadata?: Record<string, unknown>;
	isActive: boolean;
	baseUom: string;
	productName: string;
	productSku: string;
	categoryName?: string;
	brandName?: string;
	totalOnHand: number;
	totalAvailable: number;
	createdAt: string;
	updatedAt: string;
}
