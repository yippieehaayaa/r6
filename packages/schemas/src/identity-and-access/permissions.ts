// ============================================================
//  PERMISSION CATALOG
//  Static map of every known permission string to a human-readable
//  label, grouped by service → resource → action.
//
//  Purpose:
//    - Powers the checkbox matrix UI (no raw strings exposed to users)
//    - Single source of truth for all permission strings across services
//    - Each service team adds their own entries here
//
//  Structure:
//    PERMISSION_CATALOG[service][resource][action] = "Human label"
//
//  Convention: "service:resource:action"
//    e.g. PERMISSION_CATALOG["iam"]["identity"]["read"] = "View Users"
//
//  Add a new service by adding a top-level key.
//  Add a new resource by adding a key under the service.
//  Add a new action by adding a key under the resource.
// ============================================================

export type PermissionCatalog = {
  [service: string]: {
    [resource: string]: {
      [action: string]: string;
    };
  };
};

export const PERMISSION_CATALOG: PermissionCatalog = {
  // ── IAM ──────────────────────────────────────────────────
  iam: {
    identity: {
      read: "View Users",
      create: "Create Users",
      update: "Edit Users",
      delete: "Deactivate Users",
      restore: "Restore Deactivated Users",
    },
    policy: {
      read: "View Permission Sets",
      create: "Create Permission Sets",
      update: "Edit Permission Sets",
      delete: "Delete Permission Sets",
      restore: "Restore Deleted Permission Sets",
    },
    tenant: {
      read: "View Organization Settings",
      update: "Edit Organization Settings",
    },
  },

  // ── Inventory ─────────────────────────────────────────────
  // TODO: fill in when inventory service permissions are finalised
  inventory: {},

  // ── Procurement ───────────────────────────────────────────
  // TODO: fill in when procurement service permissions are finalised
  procurement: {},

  // ── POS ───────────────────────────────────────────────────
  // TODO: fill in when pos service permissions are finalised
  pos: {},

  // ── Financial ─────────────────────────────────────────────
  // TODO: fill in when financial service permissions are finalised
  financial: {},

  // ── HRIS ──────────────────────────────────────────────────
  // TODO: fill in when hris service permissions are finalised
  hris: {},
} as const;

// ── Utility helpers ─────────────────────────────────────────

/**
 * Returns the human-readable label for a permission string.
 * Returns the raw permission string if the entry is not in the catalog.
 *
 * @example
 *   getPermissionLabel("iam:identity:read") // → "View Users"
 *   getPermissionLabel("unknown:thing:do")  // → "unknown:thing:do"
 */
export function getPermissionLabel(permission: string): string {
  const [service, resource, action] = permission.split(":");
  if (!service || !resource || !action) return permission;
  return (
    (PERMISSION_CATALOG[service]?.[resource]?.[action] as string | undefined) ??
    permission
  );
}

/**
 * Returns all known permission strings as a flat array.
 * Useful for validation or building exhaustive lists.
 */
export function getAllPermissions(): string[] {
  return Object.entries(PERMISSION_CATALOG).flatMap(([service, resources]) =>
    Object.entries(resources).flatMap(([resource, actions]) =>
      Object.keys(actions).map((action) => `${service}:${resource}:${action}`),
    ),
  );
}
