---
name: SaaSify
status: final
sources:
  - '{planning_artifacts}/prds/prd-SaaSify-BMAD-20260703/prd.md'
  - '{planning_artifacts}/architecture/architecture-SaaSify-BMAD-20260703/ARCHITECTURE-SPINE.md'
  - '{planning_artifacts}/epics.md'
updated: 2026-07-03
---

# SaaSify — Experience Spine

This document governs the information architecture, user journeys, interaction patterns, and behaviors of the SaaSify Subscription Tracker. It is designed to specify *how the product works*, referencing the token system defined in `DESIGN.md`.

## Foundation

SaaSify is a client-side Single Page Application (SPA) designed for desktop and responsive web browsers. It runs entirely in-browser, persisting data in `localStorage` and synchronizing updates across active tabs. 

The visual system is dark-mode-only as defined in `DESIGN.md`. The user experience separates read-only interactions from write/mutation interactions using a mock role selector (Viewer vs. Admin).

## Information Architecture

The application layout is structured around a single screen.

| Surface | Reached from | Purpose |
|---|---|---|
| Dashboard | App open (root) | Main workspace: displays overall metrics, subscription table, and mock role selector in the header. |
| Add Modal | Click "Add Subscription" (Admin only) | Overlay dialog containing forms to create a new subscription record. |
| Edit Modal | Click "Edit" on a table row (Admin only) | Overlay dialog containing forms to update an existing subscription record. |

### Layout Structure
- **Header**: SaaSify Title + User Role Selector.
- **Metrics Grid**: Two aggregate display cards (Total Projected Monthly Spend, Active Subscriptions count).
- **Subscription List Card**: Main container containing the actions header ("Add Subscription" button, Admin only) and the Subscriptions Table.
  - **Table Columns**: Name, Cost, Billing Cycle, Status, Next Renewal Date, Actions (Admin only).

## Voice and Tone

Microcopy is dry, clear, and action-oriented. We avoid decorative notifications or congratulatory messages.

| Do | Don't |
|---|---|
| "Renewal Imminent" (crimson alert badge) | "Renewing soon!" |
| "Add Subscription" | "Track another tool!" |
| "Are you sure you want to delete {name}?" | "Warning: this action is permanent." |
| "Active", "Paused" | "Running", "Inactive" |
| "No subscriptions tracked. Add one to get started." | "Your dashboard is empty." |

## Component Patterns

### 1. Mock Role Selector
- Displays as a segmented picker or dropdown in the header indicating `Viewer` or `Admin`.
- Switches active role instantly.
- Viewer state: Hides the "Add Subscription" button and the inline action columns in the table.
- Admin state: Renders the "Add Subscription" button and action columns with interactive buttons.

### 2. Subscription CRUD Modals
- Triggered by clicking "Add Subscription" or a row's "Edit" button.
- Dismissal: Click "Cancel", click outside the modal (backdrop), or press `Esc`.
- Form Validation: Executed on "Save". Validation errors are displayed as inline text under input fields. Valid inputs close the modal and update the store.

### 3. Metric Cards
- Aggregate cards read state from the centralized store and update instantly upon mutations or role shifts.
- **Total Projected Monthly Spend**: Shows calculated monthly equivalent spend formatted to USD (e.g., `$42.50`).
- **Active Subscriptions**: Displays integer count of active subscriptions.

## State Patterns

| State | Surface | Treatment / UI Behavior |
|---|---|---|
| No Subscriptions | Table Area | Displays a placeholder text: "No subscriptions tracked. Add one to get started." (Admin) or "No subscriptions tracked." (Viewer). Metric cards display `$0.00` and `0`. |
| Validation Error | Modal Inputs | Field border turns red (`{colors.status-alert}`). Red validation message appears below the input. Focus is retained in the form. |
| Renewal Imminent | Table Row | If an active subscription's renewal is within 0-7 days of current local system time, a low-opacity red badge (`{components.status-badge-alert}`) is placed next to the Name. |
| Storage Sync | Global | If the store detects an external tab update to `localStorage`, the data refreshes in place without losing modal edits (unless the edited subscription was deleted in the other tab). |

## Interaction Primitives

- **Click / Tap**: Primary interaction mechanism for buttons, dropdowns, and modal overlays.
- **Form Navigation**: Standard `Tab` to cycle inputs, `Shift+Tab` to reverse, `Enter` to submit the form, and `Esc` to close the modal.
- **Deletion Check**: Triggering "Delete" launches a native browser `window.confirm()` before committing the delete.

## Accessibility Floor

- **Semantic HTML**: The interface uses `<table>`, `<th>`, `<td>`, `<button>`, and proper form `<label>` structures.
- **Modal Accessibility**: Modals use aria-attributes (`role="dialog"`, `aria-modal="true"`) and focus is trapped inside the active modal.
- **Contrast**: All text values maintain a minimum WCAG 2.2 AA contrast ratio of 4.5:1 against their backgrounds (designed using slate and high-contrast indigo/crimson tokens from `DESIGN.md`).

## Key Flows

### UJ-1: Viewer inspects the dashboard spend and subscriptions
- **Protagonist**: Ken, a viewer.
- **Goal**: Review monthly overhead.
- **Flow**:
  1. Ken opens the app. The role selector is set to "Viewer" by default.
  2. Ken inspects the "Total Projected Monthly Spend" card to see the calculated team spend.
  3. Ken views the "Active Subscriptions" count.
  4. Ken scrolls the table, seeing active and paused items. He notices a red "Renewal Imminent" badge next to GitHub Enterprise, alerting him it renews in 3 days.
  5. Ken closes the tab. He did not see any add, edit, or delete buttons.

### UJ-2: Admin adds and modifies subscriptions
- **Protagonist**: Winston, an admin.
- **Goal**: Update subscription list to reflect team changes.
- **Flow**:
  1. Winston opens the app and toggles the role selector in the header to "Admin".
  2. The UI instantly updates to show the "Add Subscription" button and row-level "Edit" and "Delete" buttons.
  3. Winston clicks "Add Subscription". A modal overlay opens.
  4. Winston fills out the form: Name ("Figma"), Cost ("15.00"), Cycle ("Monthly"), Status ("Active"), Date ("2026-07-20").
  5. Winston clicks "Save". The modal closes, the table appends Figma, and the dashboard spend metric increases by `$15.00` immediately.
  6. Winston spots an old trial in the list, clicks "Delete", clicks "OK" on the browser confirm prompt. The item is removed and metrics adjust.
  7. Winston closes the tab.
