import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/iam/tenants')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/iam/tenants"!</div>
}
