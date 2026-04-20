import type { OnboardTenantInput, SetupStatus } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useOnboardTenantMutation } from "@/api/inventory/setup/mutations/onboard-tenant";
import { useSetupCatalogMutation } from "@/api/inventory/setup/mutations/setup-catalog";
import { useSetupCategoriesBrandsMutation } from "@/api/inventory/setup/mutations/setup-categories-brands";
import { useSetupProductMutation } from "@/api/inventory/setup/mutations/setup-product";
import { parseApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { Step1Config } from "./steps/step-1-config";
import { Step2BaseUom } from "./steps/step-2-base-uom";
import { Step3Warehouse } from "./steps/step-3-warehouse";
import { Step4Uoms } from "./steps/step-4-uoms";
import { Step5CategoriesBrands } from "./steps/step-5-categories-brands";
import { Step6Product } from "./steps/step-6-product";

// ── Wizard step metadata ────────────────────────────────────

interface StepMeta {
	id: number;
	title: string;
	description: string;
}

const STEPS: StepMeta[] = [
	{
		id: 1,
		title: "Inventory Config",
		description: "Costing method, currency & thresholds",
	},
	{
		id: 2,
		title: "Base Unit of Measure",
		description: "Primary tracking unit for all inventory",
	},
	{
		id: 3,
		title: "First Warehouse",
		description: "Physical location for stock storage",
	},
	{
		id: 4,
		title: "Additional UOMs",
		description: "Purchase and sale units (Case, Pack, etc.)",
	},
	{
		id: 5,
		title: "Categories & Brands",
		description: "Classify and organise your products",
	},
	{
		id: 6,
		title: "First Product",
		description: "Minimum viable catalog entry",
	},
];

// ── Helpers ─────────────────────────────────────────────────

function deriveStep(status: SetupStatus): number {
	if (!status.isOnboarded || !status.hasBaseUom || !status.hasWarehouse)
		return 1;
	if (!status.hasAdditionalUoms) return 4;
	if (!status.hasCategories || !status.hasBrands) return 5;
	return 6;
}

function isStepComplete(stepId: number, status: SetupStatus): boolean {
	switch (stepId) {
		case 1:
			return status.isOnboarded;
		case 2:
			return status.hasBaseUom;
		case 3:
			return status.hasWarehouse;
		case 4:
			return status.hasAdditionalUoms;
		case 5:
			return status.hasCategories && status.hasBrands;
		case 6:
			return false; // never blocked, progress tracked locally
		default:
			return false;
	}
}

// ── Types ────────────────────────────────────────────────────

interface CollectedOnboard {
	config?: OnboardTenantInput["config"];
	baseUom?: { name: string; abbreviation: string };
}

interface Props {
	tenantId: string;
	status: SetupStatus;
	onComplete: () => void;
}

// ── Component ────────────────────────────────────────────────

export function SetupWizard({ tenantId, status, onComplete }: Props) {
	const queryClient = useQueryClient();
	const [activeStep, setActiveStep] = useState<number>(() =>
		deriveStep(status),
	);

	// Collected data for the combined onboard-tenant call (steps 1-3)
	const collected = useRef<CollectedOnboard>({});

	// Slugs created in step 5 for use in step 6 dropdowns
	const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
	const [brandSlugs, setBrandSlugs] = useState<string[]>([]);

	// Base UOM abbreviation for step 6
	const [baseUomAbbr, setBaseUomAbbr] = useState<string>("pcs");

	// Mutations
	const onboardMutation = useOnboardTenantMutation();
	const catalogMutation = useSetupCatalogMutation();
	const categoriesBrandsMutation = useSetupCategoriesBrandsMutation();
	const productMutation = useSetupProductMutation();

	// ── Step handlers ──────────────────────────────────────────

	function handleStep1Next(config: OnboardTenantInput["config"]) {
		collected.current.config = config;
		setActiveStep(2);
	}

	function handleStep2Next(baseUom: { name: string; abbreviation: string }) {
		collected.current.baseUom = baseUom;
		setBaseUomAbbr(baseUom.abbreviation);
		setActiveStep(3);
	}

	async function handleStep3Next(warehouse: {
		name: string;
		code: string;
		description?: string | "";
		addressLine1: string;
		addressLine2?: string | "";
		addressBarangay?: string | "";
		addressCity: string;
		addressProvince?: string | "";
		addressState: string;
		addressCountry: string;
		addressPostal: string;
		landmark?: string | "";
		contactName?: string | "";
		contactPhone?: string | "";
		contactEmail?: string | "";
	}) {
		const clean = (v: string | undefined): string | undefined =>
			v && v.length > 0 ? v : undefined;

		try {
			await onboardMutation.mutateAsync({
				tenantId,
				body: {
					config: collected.current.config,
					baseUom: collected.current.baseUom,
					warehouse: {
						name: warehouse.name,
						code: warehouse.code,
						description: clean(warehouse.description),
						addressLine1: warehouse.addressLine1,
						addressLine2: clean(warehouse.addressLine2),
						addressBarangay: clean(warehouse.addressBarangay),
						addressCity: warehouse.addressCity,
						addressProvince: clean(warehouse.addressProvince),
						addressState: warehouse.addressState,
						addressCountry: warehouse.addressCountry,
						addressPostal: warehouse.addressPostal,
						landmark: clean(warehouse.landmark),
						contactName: clean(warehouse.contactName),
						contactPhone: clean(warehouse.contactPhone),
						contactEmail: clean(warehouse.contactEmail),
					},
				},
			});
			await queryClient.invalidateQueries({
				queryKey: ["setup-status", tenantId],
			});
			setActiveStep(4);
		} catch (err) {
			toast.error(parseApiError(err).message);
		}
	}

	async function handleStep4Next(data: {
		uoms: Array<{
			name: string;
			abbreviation: string;
			uomType: "PURCHASE" | "SALE";
		}>;
	}) {
		try {
			await catalogMutation.mutateAsync({
				tenantId,
				body: { uoms: data.uoms },
			});
			await queryClient.invalidateQueries({
				queryKey: ["setup-status", tenantId],
			});
			setActiveStep(5);
		} catch (err) {
			toast.error(parseApiError(err).message);
		}
	}

	async function handleStep5Next(data: {
		categories?: Array<{ name: string; slug: string; description?: string }>;
		brands?: Array<{ name: string; slug: string; description?: string }>;
	}) {
		try {
			await categoriesBrandsMutation.mutateAsync({
				tenantId,
				body: data,
			});
			await queryClient.invalidateQueries({
				queryKey: ["setup-status", tenantId],
			});
			setActiveStep(6);
		} catch (err) {
			toast.error(parseApiError(err).message);
		}
	}

	async function handleStep6Next(data: {
		product: {
			sku: string;
			name: string;
			slug: string;
			description?: string;
			categorySlug?: string;
			brandSlug?: string;
		};
		variants: Array<{
			sku: string;
			name: string;
			barcode?: string;
			options: Record<string, unknown>;
			trackingType?: "NONE" | "SERIAL" | "BATCH";
			baseUomAbbreviation: string;
		}>;
	}) {
		try {
			await productMutation.mutateAsync({ tenantId, body: data });
			toast.success("Setup complete! Welcome aboard.");
			onComplete();
		} catch (err) {
			toast.error(parseApiError(err).message);
		}
	}

	// ── Render ─────────────────────────────────────────────────

	const stepTitles: Record<number, string> = {
		1: "Inventory Configuration",
		2: "Base Unit of Measure",
		3: "First Warehouse",
		4: "Additional Units of Measure",
		5: "Categories & Brands",
		6: "First Product & Variant",
	};

	const stepDescriptions: Record<number, string> = {
		1: "Configure how your inventory is costed, what currency you operate in, and key operational thresholds.",
		2: "Set the base unit used to track all inventory. You can customise the name and abbreviation.",
		3: "Add your first physical warehouse. You can add more locations later.",
		4: "Define the units used for purchasing and selling (e.g. Case, Pack, Carton).",
		5: "Add at least one category and one brand so products can be catalogued correctly.",
		6: "Create your first product with a single variant to seed your catalog.",
	};

	return (
		<div className="w-full max-w-4xl">
			{/* Title area */}
			<div className="mb-6 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">
					Set up your inventory
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Complete the steps below to get your workspace ready.
				</p>
			</div>

			<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
				{/* ── Step sidebar ── */}
				<nav
					aria-label="Setup steps"
					className="flex shrink-0 flex-row gap-1 overflow-x-auto lg:w-52 lg:flex-col lg:overflow-visible"
				>
					{STEPS.map((step) => {
						const complete = isStepComplete(step.id, status);
						const active = activeStep === step.id;
						// Steps 1-3 are shown as one block in the sidebar once submitted together
						const accessible =
							step.id <= activeStep ||
							complete ||
							(step.id <= 3 && (complete || step.id <= activeStep));

						return (
							<button
								key={step.id}
								type="button"
								onClick={() => {
									if (accessible) setActiveStep(step.id);
								}}
								disabled={!accessible}
								className={cn(
									"group flex min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
									"lg:w-full",
									active
										? "bg-accent/10 text-accent font-medium"
										: "text-muted-foreground hover:text-foreground",
									!accessible && "pointer-events-none opacity-40",
								)}
							>
								{/* Step indicator */}
								<span
									className={cn(
										"flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
										complete
											? "border-green-500 bg-green-500 text-white"
											: active
												? "border-accent bg-accent text-white"
												: "border-border bg-background text-muted-foreground",
									)}
								>
									{complete ? (
										<Check className="size-3.5" strokeWidth={2.5} />
									) : (
										step.id
									)}
								</span>
								{/* Label - hidden on very small screens, shown on lg */}
								<span className="hidden truncate lg:block">{step.title}</span>
							</button>
						);
					})}
				</nav>

				{/* ── Content card ── */}
				<div className="min-w-0 flex-1 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
					<div className="mb-5">
						<h2 className="text-base font-semibold">
							{stepTitles[activeStep]}
						</h2>
						<p className="mt-0.5 text-sm text-muted-foreground">
							{stepDescriptions[activeStep]}
						</p>
					</div>

					<div className="animate-apple-enter">
						{activeStep === 1 && (
							<Step1Config
								defaultValues={collected.current.config}
								onNext={handleStep1Next}
							/>
						)}

						{activeStep === 2 && (
							<Step2BaseUom
								defaultValues={collected.current.baseUom}
								onBack={() => setActiveStep(1)}
								onNext={handleStep2Next}
							/>
						)}

						{activeStep === 3 && (
							<Step3Warehouse
								onBack={() => setActiveStep(2)}
								onNext={handleStep3Next}
								isSubmitting={onboardMutation.isPending}
							/>
						)}

						{activeStep === 4 && (
							<Step4Uoms
								onBack={() => setActiveStep(3)}
								onNext={handleStep4Next}
								isSubmitting={catalogMutation.isPending}
							/>
						)}

						{activeStep === 5 && (
							<Step5CategoriesBrands
								onBack={() => setActiveStep(4)}
								onNext={handleStep5Next}
								onCategoriesBrandsCreated={({ categories, brands }) => {
									setCategorySlugs(categories);
									setBrandSlugs(brands);
								}}
								isSubmitting={categoriesBrandsMutation.isPending}
							/>
						)}

						{activeStep === 6 && (
							<Step6Product
								onBack={() => setActiveStep(5)}
								onNext={handleStep6Next}
								isSubmitting={productMutation.isPending}
								baseUomAbbreviation={baseUomAbbr}
								categorySlugs={categorySlugs}
								brandSlugs={brandSlugs}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
