# Route, Controller, and Request Mapping

## Establish Registration First

Read `bootstrap/app.php` and any provider or custom registration it references. Read the registered API, web, console, and additional route files relevant to the feature. Verify prefixes, domains, versioning, middleware groups, aliases, and registration order from code.

Resolve the complete endpoint by composing registration, nested group, and individual route paths. Do not add `/api` twice or assume the prefix is unchanged. Resolve resource routes, closures, invokable controllers, route-model binding, and explicit bindings when present. Check route order and overlapping dynamic paths before diagnosing a missing or unexpected action.

Read effective middleware, including group defaults, explicit additions/removals, and controller-level middleware when used. A route in an API file can still use session middleware, while a route without an auth middleware can verify a token inside its controller. Determine protection from executed code, not filenames or comments.

If the environment safely supports application boot, use `php artisan route:list` from the actual backend root to cross-check registration. Inspect available options before narrowing the output. If boot or dependencies are unavailable, document the source-based map and that runtime registration was not verified. Never create endpoints to match an example map.

## Map Each Relevant Endpoint

Record the following with source file/symbol references:

| Field | Evidence to inspect |
| --- | --- |
| HTTP method and full path | Registration, route groups, prefixes, parameters, domains, and resource expansion. |
| Controller/action | Imported namespace, action method or closure, and relevant private helpers. |
| Effective middleware and identity | Group and route middleware, guard/member resolution, direct token checks, and failure paths. |
| Authorization and ownership | Policies, gates, FormRequest authorization, controller checks, ownership-scoped queries, and route binding. |
| Request data and validation | Path/query/body/file inputs, normalization, required/optional fields, defaults, rules, and cross-field checks. |
| Models/services and tables | Actual called methods, queries, joins, relationships, model events, transaction boundaries, and external effects. |
| Response contract | HTTP status, envelope, field names/types, nullability, decimal/date formats, pagination, and error/validation shape. |
| Frontend consumers | API wrapper, caller, state updates, error handling, and refresh logic. |

For a user-facing route inventory, use a compact table with method, full endpoint, controller/action, effective middleware/authentication, and evidence. Put detailed request, validation, response, database, and consumer notes beneath the relevant feature rather than making an unreadably wide table. Keep an internal map for ordinary changes; do not force a full report on every task.

## Read the Actual Execution Path

Open the action and relevant private methods. Follow injected dependencies and imported classes to their implementation. Inspect FormRequest `rules()` and `authorize()`, inline validators, custom messages, business validation, and exception handling. Do not stop at signatures or assume every action uses a service.

Trace each input to its first use. Distinguish validated data from raw request values, trusted middleware attributes from caller-supplied identity, and route IDs from business identifiers. Resolve mass-assignment behavior, serializers, model hooks, and database effects with the database reference when applicable.

Follow success and failure branches, including early returns, validation exceptions, missing records, permission denials, integration errors, and transaction rollback. Verify error/status behavior from response construction and exception configuration rather than assuming every API uses the same envelope.

## Change and Debug Safely

Before a change, locate all registrations of the same handler/path and all known client consumers. Preserve request/response contracts unless a contract change is requested; coordinate affected consumers when it is. Do not introduce duplicate endpoints or controllers to bypass an unexplained failure.

For a failing request, compare the actual method, path, credentials, payload, status, and response against the traced path. Determine whether it reached the action before editing controller logic. Validate the correction at the affected boundary and through a relevant feature test when safe. Route listing alone does not prove validation, authorization, or business behavior.
