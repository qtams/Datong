# Financial Architecture and Change Safety

Read this before modifying amounts, balances, savings, wallet adjustments, transfers, account deletion, financial history, or related serialization. This is an engineering analysis of the application's verified rules; do not substitute assumed accounting behavior for source evidence.

## Map the Domain Before Editing

Locate and read the relevant methods and dependencies. Candidate search targets include `MemberFinanceController`, `MemberCardController`, `MemberTransferController`, `MemberCashAccount`, `MemberCard`, `MemberTransfer`, and `App\Support\Money`. Verify their current existence, methods, schemas, frontend callers, and ownership rules.

Establish what the application means by savings, card balances, on-hand cash, total money, transfers, opening balances, and manual wallet adjustments. Trace how each is stored, derived, formatted, and displayed. Do not assume all these values are independent balances or that every adjustment is a transfer.

Read summary calculations, account creation, update/deletion paths, transfer history queries, and serialization. Determine which accounts are included or excluded, how inactive/soft-deleted records affect totals, and how historical account names and references are resolved. Write down the relevant invariants before changing their implementation.

## Amounts and Representation

- Read the actual money utility, including accepted inputs, fractional precision, maximum/range behavior, integer-cent conversion, formatting, and failure handling.
- Follow validated input through conversion, arithmetic, persistence, model casts, response serialization, and frontend handling. Distinguish integer minor units, database decimals, decimal strings, and display-only formatting.
- Reuse the established money utility. Do not introduce floating-point monetary arithmetic, float casts, or lossy round trips when the application uses exact conversions. A decimal column alone does not make application arithmetic exact.
- Preserve currency and precision contracts. Validate zero, negative, excessive-precision, malformed, and out-of-range amounts according to the operation; do not silently round an invalid transfer into validity.
- Determine whether a wallet adjustment sets an absolute balance or adds a delta. Preserve that meaning and its response contract. Do not create transfer history for an adjustment unless the business rule calls for it.

## Ownership and Account Resolution

Trace the trusted member principal from verified authentication into every balance read/write and transfer query. Resolve both accounts within that member's scope. Inspect account-type validation, required IDs, primary keys versus public identifiers, active/deleted state, and missing-record behavior.

Verify source and destination are allowed, distinct accounts. Inspect member/card/cash relationships and any currency restrictions. Never accept a request-supplied owner as authority or assume a valid account ID belongs to the current member. Preserve internal-user and Firebase-member authentication boundaries.

## Atomicity and Concurrency

Before implementing or changing transfers, read the existing transaction and locking strategy across all relevant writers, including manual adjustments, account creation, and deletion.

1. Locate transaction boundaries and the connection used by every involved model. Identify which reads and checks occur inside versus outside the transaction.
2. Trace source/destination resolution and row locks. Verify insufficient-funds checks use the locked/current balance and that related writers cannot bypass the intended protection.
3. Inspect lock acquisition order, missing-account creation, unique constraints, and the behavior of simultaneous or opposing transfers. A transaction without appropriate isolation or locking does not prove race safety.
4. Follow debit, credit, and transfer-history persistence. Verify they succeed or roll back together and that no partial financial update is returned as success.
5. Preserve conservation of the transferred value across the affected accounts according to the verified currency/fee rules. Prevent prohibited negative balances and same-account transfers.
6. Inspect existing duplicate-submission, idempotency, retry, and deadlock behavior. Do not replay an ambiguous financial request as a debugging step or add an automatic retry that can duplicate a transfer or external side effect.
7. Examine exception handling and the response built after commit. Do not swallow failures, return stale balances, or report completion before required writes succeed.

Do not introduce new locks or a replacement transaction design from habit. First understand existing behavior, then make the smallest change that maintains the required invariant. If a concurrency risk is discovered, report it with the relevant writers and evidence; fix it when within the requested scope.

## Deletion and History Integrity

Read migration foreign keys, on-delete restrictions, soft-delete behavior, historical relations, and account status filters. Determine what account deletion means for current summaries and old transfers. Preserve financial history, referential integrity, and the application's deliberate treatment of deleted accounts.

Do not hard-delete historical records, remove restrictive constraints, or silently change totals to bypass an error. Follow [Database Mapping](database-mapping.md) for model events, relationship behavior, and source-schema versus runtime-schema evidence.

## Required Validation for Financial Code Changes

Use relevant existing tests and add targeted behavioral tests when changed financial behavior lacks coverage. At minimum, cover amount validation, insufficient funds, ownership isolation, and transaction behavior. Select additional cases relevant to the changed path:

- Valid amounts and exact decimal results, including the smallest supported unit and transfer of the full available balance.
- Zero, negative, malformed, excessive-precision, and out-of-range input; missing or inconsistent account IDs/types.
- Cross-member and unauthorized access to both source and destination; missing/deleted/inactive accounts; same-account rejection.
- Successful debit/credit/history creation, expected response fields, and summaries after the operation.
- A failure partway through persistence rolling back balances and history together.
- Manual adjustment semantics and interactions with transfers or deletion when those paths are affected.
- History readability after soft deletion and preserved foreign-key behavior.
- Concurrent requests, insufficient balance under contention, lock ordering, and duplicate-submission handling when the change affects them.

Confirm the effective test database is disposable before running tests, including reset traits and seeders. Fake external services; do not exercise live financial accounts or real transfers. Where concurrency matters, use a safe test database with representative transaction/locking behavior. An in-memory SQLite test does not establish production row-lock behavior; report that limit if representative checks cannot run.

Use relevant PHP syntax, route, and existing suite checks alongside behavioral tests. Do not run migrations, destructive seeders, resets, `migrate:fresh`, `db:wipe`, or production schema changes automatically. Report what was verified and what remains unproven; never label a financial change safe solely because lint or syntax checks pass.
