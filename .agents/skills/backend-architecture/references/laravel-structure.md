# Laravel Structure and Source Analysis

## Discover the Actual Application

Read applicable `AGENTS.md` guidance and the user's constraints. Locate application roots with scoped `rg --files` searches; exclude `vendor`, `node_modules`, build outputs, caches, generated storage contents, binaries, and unrelated assets. Do not read `.env`, service-account JSON, or private credential files into the conversation.

Check each target for existence rather than assuming a conventional layout:

| Discovery targets | Questions to resolve from source |
| --- | --- |
| `backend/`, `frontend/`, `composer.json`, `composer.lock`, `package.json` | Where are the actual applications? Which framework, declared constraints, resolved versions, scripts, autoload rules, and integrations are present? |
| `bootstrap/app.php`, `bootstrap/providers.php`, `app/Providers/`, `config/` | How are routing, middleware, exceptions, container bindings, and integrations registered? Which configuration key names are used? |
| `routes/api.php`, `routes/web.php`, `routes/console.php`, additional registered route files | Which files execute, with what prefixes, groups, and middleware? Are scheduled or console paths relevant? |
| `app/Http/Controllers/`, `app/Http/Middleware/`, `app/Http/Requests/` | Where do requests enter, acquire identity, receive validation, and dispatch business logic? |
| `app/Models/`, `app/Services/`, `app/Support/` | Which queries, relationships, helpers, side effects, and reusable invariants exist? Are these directories actually used? |
| `database/migrations/`, `database/seeders/`, `tests/`, test configuration | What schema is intended? Which fixtures and tests cover the behavior? Which commands could change persistent data? |
| Frontend `src/services/`, `src/auth/`, `src/lib/firebase.js`, `src/routes/`, pages and components | Which client initiates the request, supplies credentials, and consumes its response? |

Distinguish a manifest's version constraint from the lockfile's resolved version and any verified installed version. Read application bootstrap and providers before assuming that an inspection command has no side effects. Follow discovered custom entry points, modules, jobs, events, listeners, policies, or resource transformers when the task calls them.

## Read Progressively and Build Dependencies

Start with registration/configuration, then follow imports, called methods, injected dependencies, helpers, model hooks, and serializers. For large files, find method boundaries and read relevant bodies in complete sections. Do not infer code hidden by output truncation.

For each relevant controller, establish:

1. Feature responsibility and the registered routes that reach each action.
2. Namespace, imported classes, constructor dependencies, action parameters, and private helpers actually called.
3. Request fields, normalization, validation, FormRequest `authorize()` behavior, and validation failure responses.
4. Principal source, permissions, ownership checks, and query scoping.
5. Models, relationship methods, queries, service calls, transaction boundaries, and external side effects.
6. Business rules and every meaningful failure branch.
7. Success/error payloads, serializers, HTTP statuses, and frontend consumers.

Keep this as a task-scoped internal dependency map with file/symbol evidence. Map all controllers when an architecture inventory is requested; otherwise follow only the affected feature and adjacent invariants. A controller may contain business logic directly. Do not invent a separate service layer or duplicate existing helpers.

## File Storage and Cloudinary

Locate the actual storage implementation and its call sites. If `CloudinaryService`, `uploadImage`, `replaceImage`, or `deleteImage` exist, read their bodies and the controller/model code coordinating them. These names are search leads, not guaranteed APIs.

Trace validation and uploaded-file handling, configuration key names, folder selection, public IDs, secure URLs, normalized metadata, and database persistence. Distinguish an asset's identity from its delivery URL. Verify whether replacement overwrites the same public ID or creates another asset, and how cache invalidation works.

Follow success and failure paths in order: upload, database write, replacement, deletion, response normalization, cleanup, and exceptions. Determine whether failed uploads or failed database writes leave orphaned assets, and whether cleanup failure can obscure the original error. Record missing compensation honestly; do not claim it exists because a transaction surrounds database work.

Preserve public-ID and URL contracts. Reuse the current provider rather than introducing another unnecessarily. Any requested retries must be bounded and safe for the operation's identity and observed result; stop automatic retry when success is ambiguous or a repeat could overwrite/delete the wrong asset. Use fakes for validation instead of live uploads or deletes unless the task explicitly authorizes those operations.

## Evidence-Based Debugging

Identify the failing request, expected behavior, observed status/error, and relevant caller. Trace the active route, middleware, validation, action, query or service, exception handling, response, and consumer. Inspect narrow sanitized log excerpts where available.

Differentiate a transport/configuration issue, identity failure, authorization denial, validation error, missing record, query/schema problem, external-service failure, and frontend parsing error. Prove the failing boundary before changing it. Reproduce only with safe data and authorized side effects. If evidence is insufficient, state the precise unknown and continue independent inspection rather than guessing.

## Document Current Architecture Only When Requested

Create or update `backend/BACKEND_ARCHITECTURE.md` only for a specific architecture-documentation request. Do not generate it during ordinary debugging, feature implementation, or skill creation. Reverify source each time; include useful source references and the revision inspected when available.

Cover the verified directory structure; framework and version evidence; important controllers and responsibilities; endpoint inventory and middleware; authentication and authorization flows; model behavior; tables, constraints, and relationships; frontend integrations; external services and storage lifecycle; and complete request lifecycles for important features. Include financial transaction boundaries when applicable.

Separate verified source behavior, inferred intent, and unverified deployment/runtime state. Never include secrets, raw tokens, private records, or a fabricated endpoint, relationship, or service. A source map does not prove the deployed schema or route cache matches it.
