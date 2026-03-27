import { z } from "zod";
import { BaseRecordSchema, serviceNameRegex, slugRegex } from "../base.schema";

// ============================================================
//  TENANT SCHEMA
//  Represents a company (client) on the ERP SaaS platform.
//  The Tenant record owns the tenantId stamped across ALL
//  microservices (Inventory, Procurement, Transaction, etc.).
// ============================================================

/**
 * Recognised microservice / module names.
 * Validated individually inside moduleAccess arrays.
 */
export const ModuleNameSchema = z
  .string()
  .regex(
    serviceNameRegex,
    "Module name must be lowercase alphanumeric with hyphens",
  )
  .min(1, "Module name cannot be empty");

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
   * List of enabled microservice names.
   * e.g. ["inventory", "procurement", "pos", "financial"]
   */
  moduleAccess: z
    .array(ModuleNameSchema)
    .min(1, "At least one module must be enabled"),
});

export type Tenant = z.infer<typeof TenantSchema>;

// ── Create payload ──────────────────────────────────────────

export const CreateTenantSchema = TenantSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  isActive: true, // defaulted to true on creation
});

export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;

// ── Update payload (all fields optional except id) ─────────

export const UpdateTenantSchema = TenantSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).partial();

export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>;
