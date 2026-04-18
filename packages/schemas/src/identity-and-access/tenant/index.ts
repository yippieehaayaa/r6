import { z } from "zod";
import {
  BaseRecordSchema,
  ListQuerySchema,
  NullableUuidSchema,
  slugRegex,
  UuidSchema,
} from "../base.schema";
import type { TenantModule } from "../enums.schema";
import { TenantModuleEnum, TenantModuleSchema } from "../enums.schema";
export type { TenantModule };
export { TenantModuleEnum, TenantModuleSchema };

// ============================================================
//  TENANT SCHEMA
//  Represents a company (client) on the ERP SaaS platform.
//  The Tenant record owns the tenantId stamped across ALL
//  microservices (Inventory, Procurement, Transaction, etc.).
// ============================================================

// ── Full read model (as returned from the DB) ───────────────

export const TenantSchema = BaseRecordSchema.extend({
  /** Unique company name — e.g. "Acme Corporation" */
  name: z
    .string()
    .min(1, "Tenant name cannot be empty")
    .max(255, "Tenant name must not exceed 255 characters"),

  /**
   * URL-safe identifier — e.g. "acme-corp".
   * Lowercase letters, digits, and hyphens; must start and end
   * with an alphanumeric character.
   */
  slug: z
    .string()
    .regex(
      slugRegex,
      "Slug must be lowercase alphanumeric with hyphens (e.g. acme-corp)",
    )
    .min(2, "Slug must be at least 2 characters")
    .max(63, "Slug must not exceed 63 characters"),

  /** Whether the tenant account is currently active */
  isActive: z.boolean(),

  /**
   * True for the single platform tenant that owns all ADMIN identities
   * and platform-level roles/policies. There is exactly one platform
   * tenant per deployment; it cannot be created via the public API.
   */
  isPlatform: z.boolean(),

  /** Primary owner identity ID — required; the owner Identity must exist before the Tenant is created */
  ownerId: UuidSchema,

  /**
   * List of enabled paid microservice module names.
   * Empty array is valid — new tenants start with no paid modules.
   * IAM access is always implicit and is never listed here.
   */
  moduleAccess: z.array(TenantModuleSchema),
});

export type Tenant = z.infer<typeof TenantSchema>;

// ── Create payload ──────────────────────────────────────────

export const CreateTenantSchema = TenantSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  isActive: true, // defaulted to false on creation; set to true once the owner verifies email
  isPlatform: true, // server-managed — cannot be set via API
  ownerId: true, // injected from the caller's JWT identity (req.auth.sub)
});

export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;

// ── Update payload (all fields optional except id) ─────────

export const UpdateTenantSchema = TenantSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  isPlatform: true, // server-managed — cannot be changed via API
  ownerId: true, // set internally
}).partial();

export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>;

// ── Create response (tenant + one-time owner credentials) ──────────────────

/**
 * Returned by POST /tenants.
 * The caller (already an Identity) created the tenant — no owner credentials needed.
 */
export const CreateTenantResponseSchema = TenantSchema;

export type CreateTenantResponse = z.infer<typeof CreateTenantResponseSchema>;

// ── List query params ───────────────────────────────────────

export const ListTenantsQuerySchema = ListQuerySchema;

export type ListTenantsQuery = z.input<typeof ListTenantsQuerySchema>;
