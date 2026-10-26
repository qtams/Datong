---
name: backend-architecture
description: Analyze, trace, review, debug, and modify the current project's existing backend architecture. Use for Laravel, PHP, API routes, controllers, middleware, Eloquent models, migrations, databases, Firebase authentication, session authentication, financial transactions, Cloudinary integrations, and React-to-Laravel API connections. Always inspect actual repository files and trace dependencies before making backend changes.
---

# Backend Architecture

**READ THE EXISTING CODEBASE FIRST. UNDERSTAND HOW EVERYTHING CONNECTS. NEVER GUESS THE BACKEND STRUCTURE.**

Work like a senior Laravel engineer joining an existing application. Establish how a request actually executes before proposing a change. Treat earlier architecture maps, example routes, and candidate class names as leads to reverify against current source.

## Workflow

**DISCOVER → READ → TRACE → ANALYZE → IMPLEMENT → VALIDATE**

For understanding, mapping, or review requests, stop after analysis and report verified findings. Implement only when the user requests changes. Architecture documentation is a separate, explicitly requested output.

1. **Discover:** Read applicable repository guidance and locate the real application roots, manifests, entry points, routes, configuration, source, migrations, and tests. Start with [Laravel Structure](references/laravel-structure.md). Paths are discovery targets, not guarantees. If the framework or layout differs, follow the verified application rather than creating an assumed Laravel structure.
2. **Read:** Open relevant file contents progressively, beginning with entry points and configuration. Inspect class names, namespaces, imports, public actions, private helpers, validation, middleware, relationships, queries, service calls, responses, and exceptions. For large files, locate relevant symbols and read complete method bodies and called helpers in bounded sections. A folder listing or truncated method is insufficient evidence.
3. **Trace:** Build a task-scoped dependency map from the frontend consumer, when present, through HTTP transport, registered route, effective middleware, controller, request validation, models/services, database, response, and React state. Follow relevant references below. Verify ownership and authorization independently of authentication.
4. **Analyze:** Identify the current behavior, business invariants, failure point or requested extension, affected consumers, and smallest safe change. Separate source-backed facts from hypotheses and runtime unknowns. Search for existing implementations before adding routes, controllers, models, helpers, or business logic.
5. **Implement:** Follow the established architecture, conventions, and dependency boundaries. Preserve API contracts, both authentication domains, permissions, member ownership, transactions, relationships, and business rules. Avoid unrelated refactors, unnecessary dependencies, or generic repository/service layers without a demonstrated need.
6. **Validate:** Use relevant existing checks and targeted behavioral tests as described below. Report actual results and limits; never claim a fix solely because a plausible edit was made.

## Load Relevant References

Use only the references needed for the current path; a narrow task does not require an application-wide audit.

| Reference | Read when |
| --- | --- |
| [Laravel Structure](references/laravel-structure.md) | Establishing the application layout, controller dependencies, external storage lifecycle, debugging approach, or requested architecture documentation. |
| [Route Mapping](references/route-mapping.md) | Inspecting an endpoint, route registration, effective middleware, validation, request/response contract, or controller execution path. |
| [Authentication Flow](references/authentication-flow.md) | Tracing protected endpoints, Firebase member resolution, internal session authentication, CSRF, authorization, or identity isolation. |
| [Database Mapping](references/database-mapping.md) | Inspecting Eloquent behavior, migrations, constraints, relationships, query scope, deletion, or schema changes. |
| [Frontend–Backend Flow](references/frontend-backend-flow.md) | Finding React consumers, reproducing API failures, or changing request/response contracts. |
| [Financial Safety](references/financial-safety.md) | Touching money, savings, cards, cash, transfers, wallet adjustments, financial history, transactions, or locking. |

Keep a compact internal map of each relevant endpoint: method and complete path; controller/action; effective middleware; identity and authorization; validation and request fields; model/service dependencies; affected tables; transaction boundaries; response/status/errors; frontend consumers; and source locations. Expand this into user-facing tables only when useful or requested.

## Non-Negotiable Boundaries

- Never mix Firebase member identity with Laravel internal-user/session identity. Verify which controller or middleware resolves each principal and preserve its contract.
- Never print secrets from `.env`, Firebase service-account files, database credentials, API keys, bearer tokens, cookies, or effective secret configuration. Read configuration source and key names instead of dumping credentials. Inspect only necessary log excerpts and redact sensitive material before displaying it.
- Ignore dependencies, generated directories, caches, binaries, and unrelated assets during source discovery. Follow relevant application code rather than broadly ingesting the repository.
- Do not automatically execute migrations or mutate data to discover architecture. Do not run `migrate:fresh`, `db:wipe`, destructive seeders, production migrations, database resets, or other destructive operations without explicit authorization for that operation and target environment.
- Inspect setup scripts, command side effects, test bootstrap, and database configuration before execution. Do not run a setup command that implicitly migrates, seeds, installs dependencies, or changes configuration merely to inspect source.
- Trace external services without uploading, replacing, deleting, or retrying live assets merely as an investigation step. A database rollback does not undo an external storage write.
- Keep this skill project-local under `.agents/skills/backend-architecture/`. Do not install it globally or alter other repositories. Skill maintenance must not change application functionality.

## Debugging and Validation

Trace a failing endpoint from the actual caller through registration, middleware, action, validation, query or integration, response, and frontend handling. Use code, a safe reproduction, and available sanitized logs to establish root cause. Test competing explanations when evidence is incomplete; avoid speculative fixes, authentication bypasses, and swallowed exceptions.

For requested code changes, select checks supported by the actual project: PHP syntax checks on changed files, relevant existing tests, configuration inspection, and `php artisan route:list` when bootstrapping is safe. Run commands from the verified application root. Route listing and syntax checks support inspection but do not prove authorization or business correctness.

Before database tests, verify that the effective test environment targets a disposable test database and inspect reset traits, seeders, and external calls. Mock or fake external boundaries in tests where appropriate. If safe execution is unavailable, use available static checks and clearly report the unverified behavior.

Financial changes require appropriate tests for amount validation, insufficient funds, ownership isolation, and transaction behavior. Include rollback, history, and concurrency cases relevant to the change, following [Financial Safety](references/financial-safety.md). A test database without representative locking cannot establish production concurrency safety.

Review the final diff for unrelated behavior and contract changes. Report what changed, supporting evidence, checks actually run, and material gaps. For review-only work, report findings with source locations and impact without applying unrequested fixes.

## Requested Architecture Documentation

Only when specifically asked to document the current architecture, create or update `backend/BACKEND_ARCHITECTURE.md` using the documentation checklist in [Laravel Structure](references/laravel-structure.md). Verify the actual backend location before writing; if it differs, use its corresponding location and explain it.

Document verified current implementation and unresolved runtime questions. Do not create this document during skill setup or unrelated feature/debugging tasks. Reverify architecture after code changes rather than treating a saved map as authoritative.
