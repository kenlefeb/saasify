---
title: 'Story 1.1: Core Single-Page Layout & Premium Styling'
type: 'feature'
created: '2026-07-03T18:43:50-04:00'
status: 'done'
baseline_commit: '359ba3a846745184a838a55606cff116e49880a3'
context: ['_bmad-output/implementation-artifacts/epic-1-context.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The application currently lacks a visual interface and core layout structure, preventing users from seeing, toggle-checking, or managing subscriptions.

**Approach:** Create a static, pure client-side HTML5 template (`index.html`) and Vanilla CSS stylesheet (`index.css`) establishing the header, role indicator selector, aggregate metrics cards, and a styled empty subscriptions table.

## Boundaries & Constraints

**Always:**
- Pure client-side static layout served in the browser.
- Aesthetic styling must use vanilla CSS with the Google Font Inter.
- Base background must be `#0F172A`, cards `#1E293B`, and borders `1px solid #334155`.
- Component border radii must follow: 4px for badges, 8px for buttons/inputs/rows, and 12px for cards/modals.
- Visual elements must maintain WCAG 2.2 AA contrast ratios (minimum 4.5:1).

**Ask First:**
- Modifying the specific color codes or typography tokens outlined in the design system.

**Never:**
- Use TailwindCSS, Bootstrap, or any CSS utility framework.
- Add Javascript state persistence or CRUD modifications in this story; DOM structures remain static placeholders.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Initial Page Load | No data loaded | Header renders "SaaSify" title, role toggle defaults to "Viewer", spend is "$0.00", active count is "0", table displays empty placeholder. | N/A |

</frozen-after-approval>

## Code Map

- `index.html` -- Core layout structure containing header, metrics panels, and subscription table skeleton.
- `index.css` -- Design token system variable declarations, layout grid styling, components and interactive states.

## Tasks & Acceptance

**Execution:**
- [x] `index.html` -- Create HTML5 skeleton containing page structure, Google Font link tags, semantic components, and empty table placeholder -- Establishes DOM hierarchy.
- [x] `index.css` -- Write design variables, base styles, layout grids, cards, table styling, and interactive hover transitions -- Implements premium dark-mode styling.

**Acceptance Criteria:**
- Given the page is loaded in a browser, when viewed, then the dark-mode layout displays the title "SaaSify", a role selector showing "Viewer", two metrics cards displaying "$0.00" and "0", and an empty subscription list placeholder.

## Spec Change Log

*No changes yet.*

## Design Notes

```css
:root {
  --bg-base: #0f172a;
  --bg-card: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --border: #334155;
  --status-active: #10b981;
  --status-paused: #f59e0b;
  --status-alert: #ef4444;
  --font-main: 'Inter', sans-serif;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

## Verification

**Manual checks (if no CLI):**
- Open `index.html` in a local browser to visually inspect header alignment, metrics layout, spacing, and styling.

## Suggested Review Order

**Structure & Layout**

- Base single-page HTML skeleton establishing core grid containers, headers, metrics, and empty table placeholders.
  [`index.html:1`](../../index.html#L1)

**Aesthetics & Style**

- Vanilla CSS properties definition, typography, resets, responsive grid, status badges, and interactive transition states.
  [`index.css:1`](../../index.css#L1)
