import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/iam/policies')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/iam/policies"!</div>
}
