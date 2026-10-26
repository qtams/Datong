# Interaction Patterns

Consult the sections relevant to the current surface. Preserve the product's established patterns and implement only capabilities justified by the user's workflow.

## Dashboards

Identify the decisions and actions the dashboard supports. Rank information by urgency, frequency, and user role. Surface the work that needs attention, its context, and the next action.

Do not automatically build four statistic cards, a large chart, and a recent activity card. Use that composition only when the information architecture requires it. Prefer a useful work queue, table, compact summary, contextual filters, progressive disclosure, tabs, split view, side panel, or inline actions when these fit the task.

Every metric needs a clear definition and relevant period; comparisons need a baseline. A chart must answer a real question. Treat missing, stale, or unavailable data honestly. Do not fill the screen with invented KPIs or stat cards.

## Cards

Before adding a card, ask whether spacing, a heading, a divider, or a shared background already provides enough grouping. Use a card for a distinct object, selectable item, separate workflow, summary unit, or content group whose elevation matters.

Avoid nested cards and independent containers for every label/value pair. Give repeated cards consistent structure and meaningful differences. Make selection, navigation, and embedded actions unambiguous; avoid nested interactive elements or competing full-card click targets.

## Buttons and Actions

Use a clear hierarchy within each task area:

- **Primary:** the main next action.
- **Secondary:** an important alternative with less emphasis.
- **Tertiary:** a supporting or low-frequency action.
- **Destructive:** an action that removes data or has a harmful consequence, using established semantics.

Avoid multiple competing primary actions. Keep common actions visible and locate them near the content they affect. Use icons when they improve recognition; do not add an icon to every button. Icon-only controls need an accessible name and a discoverable meaning.

Use a link for navigation and a button for an operation. Make pending and disabled states understandable. Keep the action label and control width stable when showing progress. Prevent duplicate execution while an action is pending.

## Forms

Optimize for successful completion. Use persistent associated labels, appropriate input types, autocomplete where useful, logical field order, meaningful groups, concise guidance, clear required/optional conventions, and existing form components. Placeholders are examples or hints, never the only label.

Preserve values after validation and server errors. Show actionable inline errors associated with their fields; provide a form-level summary when needed and move focus appropriately after failed submission. Validate at a helpful moment without interrupting unfinished input.

Consider disabled, pending, error, and success behavior. Explain why an unavailable action cannot run; do not silently disable the only path forward. Show submit feedback, preserve input on recoverable errors, and guard duplicate submissions.

Divide long forms by meaningful tasks or domain groups, not arbitrary card sections. Use steps only when the task benefits from sequencing; preserve progress and allow correction. Keep primary submission and cancellation predictable, including on mobile.

## Tables

For data-heavy work, preserve readable comparisons with a table when appropriate. Establish column hierarchy around the information users scan and act on. Use consistent formats and units, align numeric columns, and provide access to full truncated values through keyboard and touch as well as pointer interaction.

Consider these capabilities when supported by the task and data:

- Sorting with clear direction and accessible state.
- Contextual filtering and search with visible active criteria and a clear reset.
- Pagination or incremental loading with an understandable result range and preserved context.
- Selected rows, selection scope, and bulk actions with explicit feedback.
- Discoverable row actions; reserve three-dot menus for secondary actions.
- Loading, empty, no-results, error, and unavailable states.
- Sticky headers when they aid scanning without obscuring content.
- Responsive priorities and an intentional horizontal scrolling region where needed.

Do not hide frequent or essential actions behind excessive menus. Do not convert every row into a large card just because the screen is narrow. Preserve comparison, selection, and action access across responsive transformations. Keep sorting, filtering, pagination, and selection semantics consistent with the actual data source.

## Modals and Side Panels

Use a modal for a focused task that benefits from keeping the current context. Prefer a route for a complex, navigable workflow, or an established side panel for contextual work. Avoid entire pages inside modals and stacked modal chains.

Provide a clear title, concise context when necessary, an obvious accessible close control, a visible action hierarchy, sensible maximum width, and predictable content scrolling. Keep actions reachable on short screens and with an on-screen keyboard.

Use accessible dialog primitives. Set initial focus deliberately, contain focus for modal dialogs, support keyboard dismissal according to the task, and restore focus to a sensible place when closing. Do not allow background interaction behind a modal. Protect unsaved work through the product's existing dismissal pattern.

Destructive actions require stronger confirmation proportional to their consequences. Identify the affected item, explain the consequence, and label the destructive action explicitly. Reserve typed confirmation or additional friction for consequences that justify it.

## Navigation

Make the current location and available destinations clear. Preserve the established navigation hierarchy, active state, route behavior, and responsive conventions. Group destinations by user tasks and use recognizable, stable labels. Use breadcrumbs when they resolve a meaningful hierarchy.

Keep navigation discoverable on mobile with accessible toggles, clear state, and predictable dismissal. Use tabs for related views at the same level; do not add a second competing navigation system. Preserve browser back/forward behavior and deep links when supported by the application.

## Search and Filters

Place search and filters near the content they affect. Make their scope, active criteria, result count when available, and clear/reset behavior visible. Distinguish no matches from an empty dataset and from a failed request.

Follow existing immediate or explicit-apply behavior. Preserve useful criteria across pagination and navigation according to application conventions. Handle pending searches and stale responses so older results do not replace newer input. Add URL state, debouncing, saved views, or advanced filters only when the workflow justifies them.

## Authentication and Settings

Authentication screens should explain the task, support password managers and appropriate autocomplete, preserve safe input after errors, and make recovery and submission states clear. Use existing authentication flows; styling does not authorize inventing security behavior or exposing sensitive account details.

Group settings by the user's mental model. Make saved, unsaved, pending, and failed states understandable. Follow the existing immediate-save or explicit-save model consistently. Separate destructive account actions from routine changes and state their consequences.

## Data Visualization

Start with the user's question and the actual dataset. Choose a chart suited to the comparison, trend, composition, or distribution being examined. Prefer a compact number, table, or sentence when it answers the question more clearly.

Provide meaningful titles, units, periods, scale labels, and legends where needed. Avoid misleading axes, decorative 3D treatments, and arbitrary color differences. Use semantic and series colors consistently. Provide a readable summary or accessible data alternative; important information cannot depend only on color or a hover tooltip.

Handle sparse, zero, missing, loading, and failed data deliberately. Use the installed charting approach and existing formatting conventions. Never invent values to make a chart look populated.

## Promotions and Game Interfaces

Promotions should communicate the actual offer, eligibility, conditions, and next action with a credible hierarchy. Use supplied brand assets and copy. Do not invent discounts, countdowns, scarcity, social proof, testimonials, or performance claims. Allow expressive styling when grounded in the campaign and product.

Game interfaces should preserve the visual world, readable status, responsive input feedback, discoverable controls, and clear progression and outcomes. Separate immersive play from routine settings or account tasks when their needs differ. Motion, overlays, and effects must not obscure actions or state; honor reduced-motion needs and the product's established controls.
