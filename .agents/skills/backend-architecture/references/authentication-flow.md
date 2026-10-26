# Authentication and Identity Boundaries

## Discover Each Authentication Domain Independently

Locate registered routes, effective middleware, guards/providers, controller token checks, principal models, configuration source, and frontend credential handling. Do not assume the project has both systems or that example class names still exist. When both Firebase members and internal session users are present, map them independently and never merge their identities or contracts.

Read source configuration and environment key names without printing actual keys, passwords, service-account contents, bearer tokens, cookies, or CSRF tokens. Do not make a live login or account-sync request merely to understand the implementation; sync can write records.

## Firebase Member Authentication

Investigate this candidate lifecycle and verify each step:

`React Firebase Auth → Firebase ID token → HTTP request → backend token verification → member resolution → controller → member-scoped database work → response`

Look for `MemberAuthController`, `ResolveFirebaseMember`, the member model, Firebase package/configuration and provider registration, frontend Firebase initialization, and member-auth/API wrappers. Read actual methods and called helpers.

Determine:

- How the frontend obtains and refreshes an ID token, supplies the bearer header, and handles missing or expired authentication.
- Whether each endpoint verifies the token directly in a controller, through middleware, or by another verified mechanism. A route without named auth middleware is not necessarily unauthenticated.
- Which verifier is called, how verified claims are used, and how the Firebase UID maps to a backend member. Do not replace verification with unverified token decoding or trust a UID in request data.
- Whether member synchronization creates/updates a record or an endpoint only resolves an existing one; how missing members, invalid tokens, and upstream verification failures are distinguished.
- How the resolved principal reaches the action, such as a request attribute, and which model/table represents it. Do not assume `$request->user()` is the Firebase member.
- Which claims and profile fields are authoritative; how roles, verification, and member ownership are enforced server-side. Inspect fillable fields, model hooks, and controlled updates.
- The response envelope and identity fields consumed by React, including error/status behavior.

Preserve direct-controller and middleware contracts where they differ. Do not silently add internal session requirements to member endpoints or turn member sync into internal-user login.

## Laravel Internal Session Authentication

Investigate this candidate lifecycle and verify each step:

`React login → CSRF preparation and HTTP request → Laravel auth action → session/guard → internal user → authenticated middleware → protected API → response`

Inspect `AuthController`, the internal-user model, `config/auth.php`, `config/session.php`, bootstrap middleware configuration, route groups using `web`/`auth`, frontend API wrappers, auth context, and route guards. Discover any different authentication mechanism rather than assuming a default.

Determine:

- Accepted login identifiers, normalization, password checking, remember-me behavior, failure validation, and public response fields.
- Which guard/provider resolves the user and which model supplies identity and permissions.
- How session creation, regeneration, persistence, logout invalidation, and CSRF renewal actually work.
- How CSRF is acquired and transmitted, whether cookies are included by the client, and how configured origins/proxies/session attributes affect the request. Inspect source settings without dumping effective secrets.
- Which routes have session and authentication middleware, their order, and the handling of unauthenticated API requests.
- Where role, permission, and ownership checks occur. A role in a payload, a frontend guard, or hidden UI is not proof of backend authorization.
- How current-user requests and logout responses update React state, caches, and navigation.

Preserve established cookie, CSRF, status-code, and response contracts. Do not bypass CSRF, remove middleware, or replace sessions with bearer authentication as a speculative fix.

## Cross-Domain and Authorization Checks

For each protected action, name the principal type, resolution point, authorization check, and ownership-scoped query. Distinguish internal primary keys, public member identifiers, Firebase UIDs, and frontend identifiers; similar field names do not make them interchangeable.

Verify that request-supplied IDs cannot select another member's accounts or records. Follow relationship/query scopes and route binding; do not assume authentication alone proves ownership. If a check is absent, record the evidence and impact instead of inventing an implicit policy.

For requested authentication or protected-resource changes, use safe targeted tests for missing/invalid credentials, valid authorized access, wrong owner, and the wrong authentication domain. Cover expiry/recovery, CSRF/session behavior, and permissions when relevant. Fake external Firebase boundaries where appropriate while asserting the application's verification and resolution behavior. Do not log or expose live credentials to reproduce failures.
