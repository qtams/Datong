---
name: ui-ux-taste
description: "Design, build, modify, review, or refactor frontend UI with product-aware visual judgment and implementation discipline. Use for React components, pages, dashboards, admin/CMS tools, forms, tables, modals, navigation, responsive/mobile layouts, landing pages, authentication, settings, promotions, game interfaces, cards, filters, search, data visualization, CSS, Tailwind, shadcn/ui, component libraries, UI cleanup, UX improvements, and frontend redesigns. Preserve product identity and actively prevent generic AI UI."
---

# UI/UX Taste

**DO NOT DESIGN BEFORE UNDERSTANDING THE EXISTING PRODUCT.**

Make UI decisions with the judgment of a senior product designer and frontend engineer: understand the user's task, preserve the product's identity, establish hierarchy, remove friction, and implement complete interactions. Visual polish must serve a usable product.

## Understand the Existing Product

Before proposing or changing UI:

1. Read applicable repository guidance. Locate the affected route, components, styles, assets, dependencies, and existing interaction logic. Inspect nearby screens serving similar tasks.
2. Study design tokens, CSS, Tailwind configuration or CSS theme definitions, typography, colors, spacing, radii, shadows, and breakpoints. Inspect the component library and its existing variants before adding new ones.
3. Inspect navigation, forms, buttons, cards, tables, modals, icons, and responsive behavior in the relevant area. Read the code and view the running UI when tools are available. Study user-supplied screenshots and references alongside the existing product.
4. Infer the visual grammar: density, alignment, hierarchy, surfaces, action hierarchy, brand assets, icon language, state feedback, and interaction conventions. Identify reusable components and tokens by their actual repository names.
5. Establish a short working brief: who uses this surface, their main task, what they need to decide, the primary action, constraints, and required states. Use available evidence; ask only when a missing answer materially changes the solution.

New UI must belong to the same product unless the user explicitly requests a redesign. Improve established patterns without importing a trendy design language. A redesign applies to the requested scope; it does not authorize replacing the entire application. For a new product, derive a coherent, compact visual system from the brief and references before building screens.

For reviews, inspect and report actionable findings with locations, user impact, and specific corrections. For refactors, preserve behavior, permissions, data handling, and established interaction contracts unless a requested improvement requires changing them.

## Avoid Generic AI UI

Actively check for the stereotypical AI-generated SaaS aesthetic. Do not automatically use any of the following:

- Purple/blue gradients, cyan gradients, giant gradient backgrounds, or gradient text everywhere.
- Glassmorphism, blurred translucent cards, glowing borders, neon effects, or excessive shadows.
- Floating blobs, decorative circles, random abstract shapes, or decorative sparkle icons.
- Unnecessary hero sections, enormous headings, or centered everything.
- Cards inside cards inside cards, excessive rounded rectangles, `rounded-3xl` everywhere, or pill-shaped everything.
- Oversized empty spacing, excessive section labels, or unnecessary subtitles.
- Repetitive three-column feature cards or dashboard layouts made entirely of stat cards.
- Fake testimonials, fake metrics, meaningless charts, random badges, or unnecessary status pills.
- Excessive icons, emoji as interface icons, or random Lucide icons purely for decoration.
- Generic greeting headers such as "Welcome back, John" with a waving emoji.
- "AI-powered" visual styling, unnecessary floating action buttons, or gradients added simply because a screen feels empty.

A visual effect needs a reason grounded in the product's existing identity or the user's explicit direction. Preserve distinctive established branding; restraint should not flatten every product into the same neutral template. Never fabricate production claims, testimonials, metrics, or chart data. Clearly identify sample data when a prototype requires it.

Do not make every element a separate card. Group primarily through spacing, alignment, typography, background hierarchy, dividers, and layout. Add a container only when it provides a structural purpose. When a screen feels empty, inspect its workflow and information hierarchy before adding decoration.

## Design Taste Principles

### 1. Hierarchy

Make it immediately clear where the user is, what matters, what they can do, and what is secondary. Establish one strongest visual anchor per screen or task area. Give the main task visual priority; subordinate metadata and secondary actions through type, contrast, and placement. Avoid several headings, accents, or primary buttons competing for attention.

### 2. Restraint

Use the fewest visual effects that express the hierarchy. Prefer a considered border, intentional elevation where needed, a controlled accent, and a strong primary action. Remove redundant labels, outlines, icons, and containers before adding another styling layer. Restraint still requires clear affordances and readable secondary content.

### 3. Purpose Before Decoration

For every element, ask what job it performs: improving comprehension, navigation, discoverability, state communication, or decision-making. Remove elements that perform none of these jobs. Do not add a badge, chart, helper sentence, icon, or section merely to fill space. Keep information that users need to complete the task, even when removing it would make a screenshot cleaner.

### 4. Existing Brand First

Reuse the product's brand colors, typography, logos, assets, icon language, spacing, button styles, and visual motifs. Extend existing components and tokens before inventing replacements. When patterns conflict, follow the relevant shared system and adjacent maintained screens; correct inconsistencies within scope. Do not overwrite identity with generic trends.

### 5. Typography

Create hierarchy with typography before boxes. Follow the established type scale; use size, weight, line height, spacing, and contrast deliberately. Operational interfaces need readable information density. Basic admin page titles should not become 48-64px marketing headlines unless the layout genuinely requires them. Avoid excessive type variants, all-caps labels, and muted text that becomes difficult to read.

### 6. Spacing

Follow a consistent spacing rhythm using existing tokens. Keep related labels, inputs, and actions close; separate unrelated groups more clearly. Set page gutters and vertical rhythm intentionally. Do not manufacture a "premium" appearance with huge whitespace. Dense interfaces can remain calm through disciplined alignment and grouping.

### 7. Alignment

Establish clear visual axes across headings, labels, inputs, actions, metadata, icons, and table columns. Align comparable content consistently and choose numeric alignment intentionally. Use layout primitives instead of arbitrary offsets. Check both populated and empty layouts, long labels, and wrapped content for broken alignment.

### 8. Color

Use the existing palette and semantic tokens. Accent color should convey hierarchy or meaning. Preserve established semantics: red for destructive/error, green for success, amber/yellow for warning, and muted/gray for secondary or inactive content. Do not use these meanings as random decoration or communicate state through color alone. Check existing themes when changing shared colors.

### 9. Borders and Shadows

Use subtle borders to define real boundaries. Use shadows to communicate elevation, especially overlays, rather than decorating every surface. Avoid stacking border, shadow, glow, gradient, and backdrop blur unless the established product language calls for it. Check that boundaries and focus indicators remain perceptible.

### 10. Border Radius

Use a controlled radius system with related, intentional values for buttons, inputs, cards, dropdowns, modals, and tables. Reuse existing tokens or variants. Do not automatically apply `rounded-2xl`, `rounded-3xl`, or `rounded-full` throughout the interface. Reserve pill shapes for elements whose established role supports that treatment.

## Product UI vs Marketing UI

- **Product interfaces:** CMS, admin dashboards, accounts, authentication, payments, settings, analytics, tables, and management tools should prioritize usability, scanability, readable density, predictable interactions, and efficient workflows. Lead with the user's next task and needed information.
- **Marketing interfaces:** Landing pages, promotions, and campaigns may use more expressive composition, imagery, and typography when supported by the brand and message. Build the narrative around the actual offer and credible evidence. Avoid automatic hero/feature/testimonial/pricing sequences.

Do not import marketing presentation into operational dashboards. For game interfaces, respect the game's visual world while keeping controls, progress, outcomes, and navigation legible. Distinctive styling must still support the task.

## Choose Interaction Patterns Deliberately

Read the relevant sections of [Interaction Patterns](references/interaction-patterns.md) when creating, changing, or reviewing those elements. It covers dashboards, cards, buttons, forms, tables, modals, navigation, search and filters, authentication and settings, charts, promotions, and game interfaces.

Choose patterns from the real workflow. A requested table improvement does not justify redesigning the dashboard. Add sorting, bulk actions, tabs, panels, or other capabilities only when useful to the task and supported by the available data and application behavior.

## Frontend Implementation Discipline

- Inspect and reuse shared components, utilities, tokens, and installed libraries. In React, Tailwind, or shadcn/ui projects, follow the repository's composition and variant conventions. Preserve working accessibility behavior in existing primitives.
- Keep changes focused. Extract a shared abstraction when multiple real uses justify it; avoid speculative design systems, new frameworks, or packages for an isolated visual change.
- Use semantic structure and maintainable grid/flex layouts. Avoid fragile absolute positioning, arbitrary pixel offsets, deep selector overrides, blanket `!important`, and duplicated style values when the system already provides an equivalent.
- Keep layout, data, and interaction responsibilities clear. Follow existing state, routing, API, authorization, and form patterns. Styling changes must not reset user input, break selection, or alter data semantics.
- Wire controls to real behavior. No dead buttons, dummy links, fake search, decorative pagination, or charts without meaningful data. If a required action depends on unavailable functionality, make that limitation explicit and report it.
- Preserve asset proportions, intended cropping, loading dimensions, and accessible alternatives. Use the existing icon family consistently. Animate only when motion explains a transition, state, or interaction; respect reduced motion.

## Responsive Design

Reconsider hierarchy for desktop, tablet, and mobile. Do not simply shrink the desktop layout.

- Stack related groups where appropriate, collapse secondary information with an accessible way to reveal it, and preserve primary actions.
- Adapt navigation, toolbars, filters, panels, and modals to the available space. Keep touch targets usable and avoid oversized mobile headers.
- Transform tables only when the alternative preserves essential comparisons and actions. Use horizontal scrolling when that better preserves readability; avoid accidental page-wide overflow.
- Handle long content, localization, wrapping, sticky elements, on-screen keyboards, and zoom without clipped controls or unreachable actions.
- Use the product's breakpoints and content needs. Check intermediate widths as well as the widest and narrowest layouts.

Mobile layouts should feel intentionally composed, with the most useful information visible first.

## States Are Part of Design

Consider default, hover, focus, active, selected, disabled, loading, empty, error, and success states for each meaningful interactive component. Implement those relevant to its behavior; do not invent states that have no purpose.

Distinguish initial emptiness, no search results, permission restrictions, and failures. Provide a useful next action where one exists. Keep user input on recoverable errors and communicate how to proceed. Pending actions should show progress and prevent accidental duplicate submission without blocking unrelated tasks.

Use skeletons when the content structure is known and they help users anticipate the result; use compact progress feedback for indeterminate actions. Reserve dimensions to avoid loading shifts. Do not present loading or failed requests as a zero balance or successful result.

## Accessibility

Use semantic HTML, persistent labels, correct heading order, native controls where appropriate, and button versus link semantics that match the action. Provide meaningful accessible names for icon-only controls. Use ARIA only where needed; prefer existing accessible primitives over hand-built interaction widgets.

Verify keyboard navigation, visible focus, logical focus order, overlay focus management, accessible validation messages, and usable touch targets. Ensure sufficient text and control contrast and communicate state through more than color. Preserve content and actions under zoom and reduced motion. Do not sacrifice accessibility for styling.

## Microcopy

Use direct, specific language. Name actions by their result: "Save changes", "Add member", "Delete card". Use a consistent domain vocabulary and sentence casing. Explain errors with the cause when known and the next useful action; do not blame the user or expose implementation details.

Avoid generic filler, gratuitous greetings, "Unlock your potential", "Seamlessly manage", "AI-powered" claims, and helper text that repeats a label. Add context only when it resolves ambiguity or supports a decision. Keep confirmations, empty states, loading feedback, and success messages concise and truthful.

## Verify the Result

Before considering the requested work complete:

1. Compare the implementation with the working brief, supplied references, and adjacent product UI. Check task clarity, action hierarchy, consistency, density, alignment, and unnecessary decoration. Remove unjustified cards and effects.
2. Use the project's available preview and browser tooling to inspect the changed surface at representative desktop, tablet, mobile, and intermediate widths. Include realistic long content and applicable loading, empty, and error states. Inspect screenshots when available; a successful build alone does not verify visual quality.
3. Exercise affected interactions, keyboard/focus behavior, form feedback, navigation, and relevant responsive transformations. Verify data and permissions are preserved. Use existing checks; add targeted tests only when they meaningfully protect changed behavior.
4. Run relevant repository lint, type, build, or test commands as appropriate to the change. Review the diff for unintended scope, token duplication, brittle CSS, dead controls, and unrelated modifications.
5. Report what changed and why, what was actually checked, and any material limits. Distinguish rendered verification from code inspection. For review-only requests, return prioritized findings instead of applying unrequested changes.

Finish when the requested surface is coherent, functional, consistent with the product, and verified to the extent available. Do not expand a focused task into an application-wide redesign.
