# Eloquent and Database Mapping

## Establish Schema Evidence

Locate actual models, migrations, schema dumps when present, relevant factories/seeders, query-building code, and tests. Read migrations in order, including later alterations and foreign-key changes. Do not treat the first create-table migration as the final schema.

Resolve each model's table and connection from explicit configuration or verified framework conventions. Establish primary keys, key types, incrementing behavior, public identifiers, columns, types, precision, defaults, nullability, unique constraints, indexes, foreign keys, and on-delete behavior.

Source describes intended schema; it does not prove which migrations a deployed database has applied. Use existing authorized, non-mutating schema inspection only when needed and safe, and report any source/runtime discrepancy. Never execute migrations or seeders merely to discover a schema. Do not print connection strings or credentials.

## Read Model Behavior

Inspect model contents, not just names:

- `$fillable`, `$guarded`, explicit field assignment, and protected identity/role fields.
- Casts declared as properties or methods, decimal/date/bool handling, accessors, mutators, and serialization visibility/appends.
- Relationship method bodies, related classes, key overrides, cardinality, pivot details, and eager loading.
- Query scopes, global scopes, soft deletes, `withTrashed()` usage, and restore/force-delete paths.
- Boot methods, model events, observers, generated identifiers, default roles, verification changes, and other implicit writes.
- Connection-specific behavior and any supporting services or helpers used during persistence.

Distinguish a relationship declared in Eloquent, a foreign key enforced by the database, and an association used only in application queries. Record each separately; do not invent an Eloquent method because a foreign-key column exists.

Treat candidate chains such as `Member → MemberCard → Card`, `Member → MemberCashAccount`, and `Member → MemberTransfer` as investigation leads. Verify actual definitions, keys, constraints, and query behavior before presenting them as the current architecture.

## Map the Affected Data Path

For each feature, record model/table pairs, relevant columns and types, relationship/key direction, constraints, casts, query scopes, transaction boundaries, and read/write operations. Attach source evidence to each significant claim. Follow joins, aggregates, raw queries, model events, cascades, and external effects called by those writes.

Trace ownership from the resolved principal to every query and mutation. Distinguish the internal member primary key from any public `member_id` or Firebase UID by reading actual comparisons and foreign keys. Do not trust a caller-supplied owner field or infer ownership from a record ID alone.

Inspect uniqueness and concurrency assumptions, such as one cash account per member. An application-level `firstOrCreate()` does not by itself demonstrate an enforced unique database constraint. Map where transactions begin/end, when rows are locked, and how failure rolls back related writes.

## Deletion and History

Trace deletion from controller/service through model behavior and foreign keys. Identify soft deletion, hard deletion, restriction, cascade, nulling, restoration, and historical lookups. Check whether balances, summaries, transfer history, and related assets change when a record becomes inactive or deleted.

Do not replace soft deletion with hard deletion, drop restrictive foreign keys, or remove historical associations to make a failing operation pass. Financial records require the additional [Financial Safety](financial-safety.md) checks.

## Schema and Query Changes

When a requested change truly requires schema work, follow existing migration conventions and identify compatibility, existing-data, index, constraint, and relationship effects. Creating a migration file does not authorize executing it. Do not add assumed columns, duplicate models, or speculative indexes without evidence from the query and task.

Preserve unrelated business rules and serialization contracts. Check query scope and selected fields before optimizing; avoid changing aggregates, pagination, or decimal types inadvertently. Test affected relationships, constraints, ownership, deletion, and transaction behavior in a verified disposable test environment. Inspect reset traits and seeders before running tests so they cannot target real data.
