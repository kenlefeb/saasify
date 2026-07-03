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

### Review Findings

1. **`decision-needed`** findings (unchecked):
   - [x] [Review][Decision] Color Contrast Failure on Active/Paused Badges — Contrast ratios for active (#10b981) and paused (#f59e0b) badges are too low against the card background (#1e293b), failing WCAG AA (minimum 4.5:1).
   - [x] [Review][Decision] Spec Token Alert Color Modified — The alert color `--status-alert` was changed from `#ef4444` to `#f87171` to satisfy WCAG AA contrast (minimum 4.5:1), modifying a spec design token without prior approval.
   - [x] [Review][Decision] Typography Token Main Font Modified — The `--font-main` token in `index.css` was changed to include browser-native fallback fonts instead of the exact spec token value `'Inter', sans-serif`.

2. **`patch`** findings (unchecked):
   - [x] [Review][Patch] Empty placeholder row colspan mismatch [index.html:72]
   - [x] [Review][Patch] Table rows lack border-radius styling [index.css:240]
   - [x] [Review][Patch] Visual misalignment of badge-alert [index.css:295]
   - [x] [Review][Patch] Missing system theme preference support (color-scheme: dark) [index.css:4]
   - [x] [Review][Patch] Brittle Actions column visibility state toggling [index.css:313]
   - [x] [Review][Patch] Table row hover state virtually invisible [index.css:266]
   - [x] [Review][Patch] Table container focus indicator uses box-shadow instead of outline [index.css:224]
   - [x] [Review][Patch] Missing Interactive ARIA Attributes on Add Button [index.html:48]

3. **`defer`** findings (checked off, marked deferred):
   - [x] [Review][Defer] Hardcoded Pixel Font Sizes and Spacings [index.css:7] — deferred, pre-existing
   - [x] [Review][Defer] Third-Party Blocking Network Requests for Fonts [index.html:9] — deferred, pre-existing
   - [x] [Review][Defer] Metric Card Layout Inflexible on Desktop [index.css:135] — deferred, pre-existing
   - [x] [Review][Defer] Missing Column Width Constraints in Subscriptions Table [index.css:240] — deferred, pre-existing
   - [x] [Review][Defer] Complete Absence of Print Styles [index.css:329] — deferred, pre-existing

## Spec Change Log

* 2026-07-03: Updated design tokens after code review to satisfy WCAG AA contrast (Active: #34d399, Paused: #fbbf24, Alert: #f87171) and approved fallback font stack for --font-main.

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
  --status-active: #34d399;
  --status-paused: #fbbf24;
  --status-alert: #f87171;
  --font-main: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
