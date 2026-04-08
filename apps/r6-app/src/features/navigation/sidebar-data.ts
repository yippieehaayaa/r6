import {
	BarChart3,
	ClipboardList,
	GalleryVerticalEnd,
	Package,
	PackagePlus,
	PackageSearch,
	Receipt,
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
			title: "Point of Sale",
			url: "#",
			icon: Receipt,
			isActive: true,
			items: [
				{
					title: "New Sale",
					url: "#",
					permission: "pos:sale:create",
				},
				{
					title: "Transaction History",
					url: "#",
					permission: "pos:transaction:read",
				},
				{
					title: "Receipts",
					url: "#",
					permission: "pos:receipt:read",
				},
			],
		},
		{
			title: "Inventory",
			url: "#",
			icon: Package,
			items: [
				{
					title: "Stock Overview",
					url: "#",
					permission: "inventory:stock:read",
				},
				{
					title: "Warehouses",
					url: "#",
					permission: "inventory:warehouse:read",
				},
				{
					title: "Movements",
					url: "#",
					permission: "inventory:movement:read",
				},
				{
					title: "Damage & Losses",
					url: "#",
					permission: "inventory:damage:read",
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
					url: "#",
					permission: "catalog:product:read",
				},
				{
					title: "Variants",
					url: "#",
					permission: "catalog:variant:read",
				},
				{
					title: "Categories",
					url: "#",
					permission: "catalog:category:read",
				},
				{
					title: "Brands",
					url: "#",
					permission: "catalog:brand:read",
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
					permission: "procurement:order:read",
				},
				{
					title: "Suppliers",
					url: "#",
					permission: "procurement:supplier:read",
				},
				{
					title: "Receive Items",
					url: "#",
					permission: "procurement:receiving:create",
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
					permission: "report:gmv:read",
				},
				{
					title: "By Product",
					url: "#",
					permission: "report:product:read",
				},
				{
					title: "By Brand",
					url: "#",
					permission: "report:brand:read",
				},
				{
					title: "By Warehouse",
					url: "#",
					permission: "report:warehouse:read",
				},
				{
					title: "Dead Stock",
					url: "#",
					permission: "report:deadstock:read",
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
					title: "Roles",
					url: "/r6/iam/roles",
					permission: "iam:role:read",
				},
				{
					title: "Policies",
					url: "/r6/iam/policies",
					permission: "iam:policy:read",
				},
				{
					title: "Tenants",
					url: "/r6/iam/tenants",
					adminOnly: true,
				},
			],
		},
	],
	projects: [
		{
			name: "New Sale",
			url: "#",
			icon: Receipt,
			permission: "pos:sale:create",
		},
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
			name: "Stock Overview",
			url: "#",
			icon: PackageSearch,
			permission: "inventory:stock:read",
		},
		{
			name: "Add Product",
			url: "#",
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
