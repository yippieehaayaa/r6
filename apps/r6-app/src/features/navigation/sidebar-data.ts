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
				},
				{
					title: "Transaction History",
					url: "#",
				},
				{
					title: "Receipts",
					url: "#",
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
				},
				{
					title: "Warehouses",
					url: "#",
				},
				{
					title: "Movements",
					url: "#",
				},
				{
					title: "Damage & Losses",
					url: "#",
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
				},
				{
					title: "Variants",
					url: "#",
				},
				{
					title: "Categories",
					url: "#",
				},
				{
					title: "Brands",
					url: "#",
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
				},
				{
					title: "Suppliers",
					url: "#",
				},
				{
					title: "Receive Items",
					url: "#",
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
				},
				{
					title: "By Product",
					url: "#",
				},
				{
					title: "By Brand",
					url: "#",
				},
				{
					title: "By Warehouse",
					url: "#",
				},
				{
					title: "Dead Stock",
					url: "#",
				},
				{
					title: "Seasonal Demand",
					url: "#",
				},
			],
		},
		{
			title: "Identity & Access",
			url: "/iam",
			icon: Shield,
			items: [
				{
					title: "Overview",
					url: "/iam",
				},
				{
					title: "Identities",
					url: "/iam/identities",
				},
				{
					title: "Roles",
					url: "/iam/roles",
				},
				{
					title: "Policies",
					url: "/iam/policies",
				},
				{
					title: "Tenants",
					url: "/iam/tenants",
				},
			],
		},
	],
	projects: [
		{
			name: "New Sale",
			url: "#",
			icon: Receipt,
		},
		{
			name: "New Purchase Order",
			url: "#",
			icon: ClipboardList,
		},
		{
			name: "Receive Items",
			url: "#",
			icon: PackagePlus,
		},
		{
			name: "Stock Overview",
			url: "#",
			icon: PackageSearch,
		},
		{
			name: "Add Product",
			url: "#",
			icon: Tag,
		},
		{
			name: "Add Supplier",
			url: "#",
			icon: Truck,
		},
	],
};
