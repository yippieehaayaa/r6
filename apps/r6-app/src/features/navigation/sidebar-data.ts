import {
	BarChart3,
	ClipboardList,
	GalleryVerticalEnd,
	Package,
	PackagePlus,
	PackageSearch,
	Shield,
	Tag,
	Truck,
} from "lucide-react";

export const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "R6 Inc",
			logo: GalleryVerticalEnd,
			plan: "Enterprise",
		},
	],
	navMain: [
		{
			title: "Inventory",
			url: "/r6/inventory",
			icon: Package,
			items: [
				{
					title: "Overview",
					url: "/r6/inventory",
				},
				{
					title: "Stock Operations",
					url: "/r6/inventory/stock",
				},
				{
					title: "Movements",
					url: "/r6/inventory/movements",
				},
				{
					title: "Alerts",
					url: "/r6/inventory/alerts",
				},
			],
		},
		{
			title: "Catalog",
			url: "#",
			icon: Tag,
			items: [
				{
					title: "Products",
					url: "/r6/inventory-and-catalog/products",
					// permission: "catalog:product:read",
				},
				{
					title: "Variants",
					url: "/r6/inventory-and-catalog/variants",
					// permission: "catalog:variant:read",
				},
				{
					title: "Categories",
					url: "/r6/inventory-and-catalog/categories",
					// permission: "catalog:category:read",
				},
				{
					title: "Brands",
					url: "/r6/inventory-and-catalog/brands",
					// permission: "catalog:brand:read",
				},
			],
		},
		{
			title: "Procurement",
			url: "#",
			icon: Truck,
			items: [
				{
					title: "Purchase Orders",
					url: "#",
					// permission: "procurement:order:read",
				},
				{
					title: "Suppliers",
					url: "#",
					// permission: "procurement:supplier:read",
				},
				{
					title: "Receive Items",
					url: "#",
					// permission: "procurement:receiving:create",
				},
			],
		},
		{
			title: "Financial Reports",
			url: "#",
			icon: BarChart3,
			items: [
				{
					title: "Overview / GMV",
					url: "#",
					// permission: "report:gmv:read",
				},
				{
					title: "By Product",
					url: "#",
					// permission: "report:product:read",
				},
				{
					title: "By Brand",
					url: "#",
					// permission: "report:brand:read",
				},
				{
					title: "By Warehouse",
					url: "#",
					// permission: "report:warehouse:read",
				},
				{
					title: "Dead Stock",
					url: "#",
					// permission: "report:deadstock:read",
				},
				{
					title: "Seasonal Demand",
					url: "#",
					permission: "report:seasonal:read",
				},
			],
		},
		{
			title: "Identity & Access",
			url: "/r6/iam",
			icon: Shield,
			items: [
				{
					title: "Overview",
					url: "/r6/iam",
					permission: "iam:identity:read",
				},
				{
					title: "Identities",
					url: "/r6/iam/identities",
					permission: "iam:identity:read",
				},
				{
					title: "Policies",
					url: "/r6/iam/policies",
					permission: "iam:policy:read",
				},
				{
					title: "Tenants",
					url: "/r6/iam/tenants",
					permission: "iam:tenant:read",
				},
			],
		},
	],
	projects: [
		{
			name: "New Purchase Order",
			url: "#",
			icon: ClipboardList,
			permission: "procurement:order:create",
		},
		{
			name: "Receive Items",
			url: "#",
			icon: PackagePlus,
			permission: "procurement:receiving:create",
		},
		{
			name: "Stock Operations",
			url: "/r6/inventory/stock",
			icon: PackageSearch,
			permission: "inventory:stock:read",
		},
		{
			name: "Add Product",
			url: "/r6/inventory-and-catalog/products",
			icon: Tag,
			permission: "catalog:product:create",
		},
		{
			name: "Add Supplier",
			url: "#",
			icon: Truck,
			permission: "procurement:supplier:create",
		},
	],
};
