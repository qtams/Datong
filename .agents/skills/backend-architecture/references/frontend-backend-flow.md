# Frontend–Backend Request Flow

## Locate the Real Consumer

If a frontend exists, discover its root, manifest, routes, auth context, API wrappers, and callers. Start with `src/services/`, `src/auth/`, `src/lib/firebase.js`, `src/routes/`, and relevant pages/components when those paths exist. Follow imports and symbol references rather than guessing a consumer from a filename.

Trace the complete path:

`Frontend component → API service → HTTP request → registered Laravel route → middleware → controller → model/service → database → response → API parsing → React state`

For a feature request, identify all files along that path before editing the API. For example, a transfer change may involve a modal, member-finance wrapper, route/action, validation, money helper, models, migrations, locking, response mapping, and post-submit refresh. Verify their current names and existence.

## Inspect the Transport Contract

Read the wrapper and actual caller. Establish:

- Base URL construction, path prefix, dev proxy or same-origin behavior, method, and route/query parameters.
- JSON versus multipart payload, field names, normalization, file fields, and method spoofing when used.
- Bearer token acquisition versus session cookies/CSRF. Use [Authentication Flow](authentication-flow.md) when identity is involved; do not share the two domains' credential logic accidentally.
- Accepted headers, content negotiation, and how responses with no body or non-JSON content are handled.
- Success/error status handling, validation errors, authentication expiry behavior, and whether the wrapper returns the full envelope or unwraps a property.
- Cancellation, retries, duplicate submissions, and the handling of stale responses where relevant.

Inspect configuration source and environment key names only. Do not print actual API keys, tokens, passwords, cookies, or private environment values.

## Follow Payloads Into State

Record the request shape, backend validation and defaults, response shape, and exact consumer assumptions. Check field names/types, optional/null values, decimal amounts, date/time formatting, identifiers, pagination, error properties, and derived UI calculations.

Trace successful actions into local state, shared context, cached data, refresh calls, modal close behavior, and user feedback. Trace failures into validation display, preserved input, retries, or navigation. A correct network response can still fail because the wrapper or component expects another envelope.

Search for every known consumer before renaming response properties, changing identifiers or status codes, converting decimal strings to numbers, or removing fields. Preserve existing contracts unless the user requests a contract change; coordinate the verified consumers and tests when one is necessary. Frontend visibility is not backend authorization.

## Diagnose and Validate at the Boundary

Compare an observed request to the route map: method/path, credential mechanism, payload, status, and body interpretation. Determine whether the failure occurs before the backend action, in validation/business logic, in serialization, in the wrapper, or in the state update. Use sanitized evidence; never paste live authentication data.

For requested changes, exercise the affected behavior with existing safe tests or preview tooling when available. Include error handling, ownership/authentication failures, and refresh behavior relevant to the task. Do not make mutating production requests, upload/delete live assets, or create real transfers merely to confirm a map. Report whether validation covered only the API contract or the full React-to-backend flow.
