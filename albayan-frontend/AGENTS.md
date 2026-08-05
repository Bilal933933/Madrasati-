<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:frontend-rules -->
# Frontend rules

Feature-based structure (`features/{domain}/{components,hooks,services,types}`), TanStack Query for server state, Zustand for client state, all HTTP through `lib/apiClient.ts`, generated API types in `types/api.generated.ts`, Arabic/RTL UI, and error display via `lib/apiErrors.ts`. See `.cursor/rules/madrasati-frontend.mdc` for the full ruleset.
<!-- END:frontend-rules -->
