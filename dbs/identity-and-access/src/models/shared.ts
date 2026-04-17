// ============================================================
//  shared.ts
//  Pagination primitives shared across all use-cases.
//  Import from here instead of repeating the skip/take formula.
// ============================================================

// Base input for any paginated list query.
// page is 1-based. skip = (page - 1) * limit is computed by buildPaginationQuery.
export type PaginationInput = {
  page: number;
  limit: number;
};

// Shared paginated result wrapper.
// data: page of records, total: total matching rows (for UI pagination),
// page: current page (1-based), limit: page size used.
export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

// Computes skip + take from a PaginationInput.
// Call this at the top of every list use-case instead of repeating the formula.
export const buildPaginationQuery = (
  input: PaginationInput,
): { skip: number; take: number } => ({
  skip: (input.page - 1) * input.limit,
  take: input.limit,
});
