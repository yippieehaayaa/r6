# Frontend Patterns — React + TanStack Router/Query/Table + Axios

## Folder Structure

```
src/
├── api/
│   ├── _app.ts              Axios instances + interceptors
│   ├── session-events.ts    emitSessionExpired / onSessionExpired
│   ├── token.ts             getToken / setToken (in-memory)
│   ├── <domain>/
│   │   ├── index.ts         Re-exports all queries + mutations
│   │   ├── queries/
│   │   │   └── list-<entity>.ts
│   │   └── mutations/
│   │       └── create-<entity>.ts
├── auth.tsx                 AuthProvider + useAuth()
├── config.ts                env.API_URL etc.
├── features/
│   └── <domain>/
│       └── <feature>/
│           ├── page.tsx
│           ├── <feature>-table.tsx
│           └── <feature>-sheet.tsx   (create/edit drawer)
├── components/
│   ├── table/
│   │   └── data-table.tsx   Shared DataTable wrapper
│   └── ui/                  shadcn/ui components
├── lib/
│   ├── api-error.ts         getApiErrorMessage(error)
│   └── parse-token.ts       parseTokenClaims(jwt)
└── routes/
    ├── __root.tsx
    └── <path>.tsx            One file per route
```

---

## Axios Instances (`src/api/_app.ts`)

Two named instances, one per microservice:

```typescript
export const identityApi  = axios.create({ baseURL: `${env.API_URL}/identity-and-access`,  withCredentials: true });
export const inventoryApi = axios.create({ baseURL: `${env.API_URL}/inventory-and-catalog`, withCredentials: true });
```

Both get `attachAuthInterceptors()` applied which:
1. **Request** — injects `Authorization: Bearer <token>` from in-memory store.
2. **Response 401** — silently calls `/auth/refresh`, retries original request exactly once.
3. **Refresh failure** — clears token, fires best-effort logout, emits `sessionExpired` event.

Use `identityApi` for IAM calls, `inventoryApi` for Inventory/Catalog calls. Never use the default `api` instance for authenticated requests.

---

## TanStack Query — Query Hook Pattern

File: `src/api/<domain>/queries/<list|get>-<entity>.ts`

```typescript
import { type MyEntity, MyEntitySchema, PaginatedResponseSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

// 1. Raw async function — testable, usable outside React
export async function listProductsFn(params: ListProductsParams) {
  const { data } = await inventoryApi.get<unknown>("/catalog/products", { params });
  return PaginatedResponseSchema(MyEntitySchema).parse(data); // always validate
}

// 2. Hook wrapping the function
export function useListProductsQuery(params: ListProductsParams, options?: { staleTime?: number }) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => listProductsFn(params),
    ...options,
  });
}
```

**Query key conventions:**
- List: `["<entities>", tenantSlug?, params]`
- Single: `["<entity>", id]`
- Nested: `["<parent>", parentId, "<children>"]`

---

## TanStack Query — Mutation Hook Pattern

File: `src/api/<domain>/mutations/<verb>-<entity>.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function createIdentityFn(tenantSlug: string, input: CreateIdentityInput) {
  const { data } = await identityApi.post<unknown>(`/tenants/${tenantSlug}/identities`, input);
  return IdentitySafeSchema.parse(data);
}

export function useCreateIdentityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantSlug, input }: { tenantSlug: string; input: CreateIdentityInput }) =>
      createIdentityFn(tenantSlug, input),
    onSuccess: (_data, { tenantSlug }) => {
      queryClient.invalidateQueries({ queryKey: ["identities", tenantSlug] });
    },
  });
}
```

Always invalidate the relevant list query on success. Use `toast.success()` / `toast.error()` in the component (not the hook) for user feedback. Use `getApiErrorMessage(error)` to extract a human-readable string from Axios errors.

---

## TanStack Router — File-Based Routing

Each route file exports a `Route` constant. The filename maps to the URL path.

```typescript
// src/routes/dashboard/products.tsx  →  /dashboard/products
import { createFileRoute } from "@tanstack/react-router";
import ProductsPage from "@/features/catalog/products/page";

export const Route = createFileRoute("/dashboard/products")({
  component: ProductsPage,
});
```

**Root route** (`src/routes/__root.tsx`) uses `createRootRouteWithContext` with `{ queryClient: QueryClient; auth: AuthContext }`. All nested routes can access these via `Route.useRouteContext()`.

**Authenticated layout route** — create a `_authenticated.tsx` layout route that redirects to `/login` if `auth.status !== "authenticated"`.

**Path parameters:**
```typescript
export const Route = createFileRoute("/tenants/$tenantSlug/identities")({
  component: IdentitiesPage,
});
// In component: const { tenantSlug } = Route.useParams();
```

**Route re-generation** — TanStack Router auto-generates `src/routeTree.gen.ts` via the Vite plugin. Never edit this file manually.

---

## TanStack Table — Data Table Pattern

The shared `<DataTable>` component (`@/components/table/data-table`) handles layout, toolbar, pagination UI, and sorting internally. Pass `onPaginationChange` / `onSortingChange` / `onGlobalFilterChange` to switch it into server-side mode automatically.

### `DataTableProps<TData, TValue>` — exact interface

```typescript
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;

  // Client-side pagination defaults
  defaultPageSize?: number;              // default: 20
  pageSizeOptions?: number[];            // default: [10, 20, 50, 100]

  // Server-side pagination — provide all three together
  rowCount?: number;                     // total record count from API
  paginationState?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;

  // Server-side sorting
  sortingState?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;

  // Server-side filtering
  globalFilterValue?: string;
  onGlobalFilterChange?: (value: string) => void;
  filterPlaceholder?: string;            // default: "Search…"

  // Row interaction
  onRowClick?: (row: TData) => void;
}
```

> **Mode detection is automatic:** if `onPaginationChange` is provided, `manualPagination: true` is set internally; same for sorting and filtering. You never set `manualPagination` yourself.

### Usage example

```typescript
import type { ColumnDef, OnChangeFn, PaginationState } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/table/data-table";

interface Props {
  data: Product[];
  isLoading: boolean;
  rowCount?: number;
  paginationState?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  globalFilterValue?: string;
  onGlobalFilterChange?: (value: string) => void;
  onEdit: (row: Product) => void;
}

export function ProductsTable({ data, isLoading, rowCount, paginationState, onPaginationChange, globalFilterValue, onGlobalFilterChange, onEdit }: Props) {
  const columns = useMemo<ColumnDef<Product>[]>(() => [
    { accessorKey: "name",   header: "Name" },
    { accessorKey: "status", header: "Status",
      cell: ({ row }) => <Badge>{row.original.status}</Badge> },
    { id: "actions", enableSorting: false, enableHiding: false,
      cell: ({ row }) => <ActionsMenu row={row.original} onEdit={onEdit} /> },
  ], [onEdit]);

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      rowCount={rowCount}
      paginationState={paginationState}
      onPaginationChange={onPaginationChange}
      globalFilterValue={globalFilterValue}
      onGlobalFilterChange={onGlobalFilterChange}
    />
  );
}
```

**Server-side pagination** — The API owns the source of truth. Map `pageIndex + 1 → page` before passing to the query:

```typescript
const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });

const { data, isLoading } = useListProductsQuery({
  page:  pagination.pageIndex + 1,
  limit: pagination.pageSize,
});
```

---

## TanStack Virtual — Long Lists

Use `@tanstack/react-virtual` for rendering very long lists or infinite-scroll tables instead of paginated ones. The `useVirtualizer` hook requires a container ref and total item count.

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

const parentRef = useRef<HTMLDivElement>(null);
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 48,  // row height in px
  overscan: 5,
});

return (
  <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
    <div style={{ height: virtualizer.getTotalSize() }}>
      {virtualizer.getVirtualItems().map((vItem) => (
        <div key={vItem.key} style={{ position: "absolute", top: vItem.start, height: vItem.size }}>
          <Row item={items[vItem.index]} />
        </div>
      ))}
    </div>
  </div>
);
```

Combine with TanStack Table by using `table.getRowModel().rows` as the `items` array.

---

## Auth Context (`src/auth.tsx`)

```typescript
const { status, isAuthenticated, claims, profile, hasPermission, hasRole, login, logout } = useAuth();

// Gate UI actions
const canCreate = hasPermission("iam:identity:create");
const isAdmin   = claims?.kind === "ADMIN";

// Tenant slug: from JWT for regular user, from state picker for ADMIN
const tenantSlug = isAdmin ? selectedTenantSlug : (claims?.tenantSlug ?? "");
```

`status` is `"loading" | "authenticated" | "unauthenticated"`. Render loading state while `"loading"`.

---

## Error Handling in Components

`src/lib/api-error.ts` — exact implementation:

```typescript
import type { AxiosError } from "axios";

type ApiError = {
  error: string;
  message: string;
  details?: Record<string, unknown>;
};

type ParsedApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export function parseApiError(err: unknown): ParsedApiError {
  const axiosErr = err as AxiosError<ApiError>;
  const data = axiosErr.response?.data;
  return {
    code: data?.error ?? "unknown_error",
    message: data?.message ?? (err as Error).message ?? "An unexpected error occurred",
    details: data?.details,
  };
}

export function getApiErrorMessage(err: unknown): string {
  return parseApiError(err).message;
}
```

- `getApiErrorMessage` — use in components to display toast messages.
- `parseApiError` — use when you need the `code` (e.g., to branch on `"not_found"` vs `"forbidden"`) or the `details` object (e.g., field-level Zod errors).

Usage:

```typescript
import { getApiErrorMessage, parseApiError } from "@/lib/api-error";

const mutation = useCreateProductMutation();

async function handleSubmit(values: FormValues) {
  try {
    await mutation.mutateAsync(values);
    toast.success("Product created");
    onClose();
  } catch (err) {
    toast.error(getApiErrorMessage(err));
  }
}

// When you need the error code:
const { code, message, details } = parseApiError(err);
if (code === "validation_error") { /* show field errors */ }
```

---

## Search Debouncing

```typescript
const [search, setSearch]               = useState("");
const [debouncedSearch, setDebounced]   = useState("");

useEffect(() => {
  const id = setTimeout(() => setDebounced(search), 300);
  return () => clearTimeout(id);
}, [search]);

// Pass debouncedSearch to the query, not search
```

---

## Shared Schema Usage

```typescript
import { type IdentitySafe, IdentitySafeSchema, PaginatedResponseSchema } from "@r6/schemas";

// Validate API response
const result = PaginatedResponseSchema(IdentitySafeSchema).parse(response.data);

// Type form inputs
import type { CreateProductInput } from "@r6/schemas";
```
