# Epic 1 Context: Dashboard Core & Subscription Metrics

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Set up the premium single-page dashboard structure, color theme, and typography. Initialize the centralized component store (SubscriptionStore) with pre-seeded mock subscription data and dynamic local timezone date calculations to display the active subscription list, key metric cards (Projected Monthly Spend and Active Subscriptions Count), and "Renewal Imminent" badges.

## Stories

- Story 1.1: Core Single-Page Layout & Premium Styling
- Story 1.2: Centralized Store & Localized Mock Seeding
- Story 1.3: Active Subscriptions List & Timezone-Aware Dates
- Story 1.4: Projected Spend and Active Count Metric Cards
- Story 1.5: Renewal Imminent Alert Badges

## Requirements & Constraints

- **Branding & Indicator**: Displays the title "SaaSify" in the header along with a mock user role indicator (defaulting to "Viewer").
- **Metric Cards**: Below the header, show two key aggregates:
  - "Total Projected Monthly Spend": Sum of active monthly cost equivalents (cost for MONTHLY, cost / 12 for ANNUAL, 0 for PAUSED).
  - "Active Subscriptions": Total count of subscriptions with status `ACTIVE`.
- **Subscriptions Table**: Displays columns for Name, Cost (formatted in USD, e.g. `$14.99`), Billing Cycle (`MONTHLY` or `ANNUAL`), Status (`ACTIVE` or `PAUSED`), and Next Renewal Date.
- **Seeded Data**: Pre-seeds 3 to 4 mock entries (e.g. Netflix - Active/Monthly, GitHub Enterprise - Active/Annual with renewal within 7 days, Adobe CC - Paused) if no prior data is found in `localStorage` under the `saasify_subscriptions` key. Seeding must dynamically calculate renewal dates (e.g., current local date + 3 days for the imminent item) to ensure alert badges render.
- **Renewal Alert Badge**: Shows a crimson "Renewal Imminent" badge next to any Active subscription whose renewal date is within 0 to 7 days in the future relative to the client's current local date. Paused, overdue, or >7 days dates must not display the badge.

## Technical Decisions

- **Pure Client-Side (AD-1)**: Single Page Application running entirely in the browser with no backend API execution.
- **Centralized Store (AD-2)**: All state management and mutations must go through the `SubscriptionStore` class API. Components subscribe to this store for updates rather than mutating state directly.
- **LocalStorage Sync (AD-3)**: Persist subscription data under the `saasify_subscriptions` key and the active role under the `saasify_active_role` key. Prevent tab synchronization loops by comparing serializations before triggering reloads on `storage` events.
- **Local Timezone Date Parsing**: Manually split YYYY-MM-DD date strings by `-` and parse them using `new Date(y, m-1, d)` to avoid 1-day timezone parsing drift that occurs with UTC midnight-defaulting constructor calls.
- **UUID Fallback**: Generate IDs using `crypto.randomUUID()` with a safe standard math-random-based string generator fallback in non-secure HTTP environments.

## UX & Interaction Patterns

- **Color Theme**: Dark-mode-only dashboard.
  - Base background (`#0F172A`)
  - Card background (`#1E293B`)
  - Border outline (`#334155`, 1px solid, flat profile)
  - Interactive Accent (`#6366F1`)
  - Active Status (`#10B981` text, `rgba(16, 185, 129, 0.1)` background)
  - Paused Status (`#F59E0B` text, `rgba(245, 158, 11, 0.1)` background)
  - Alert Status (`#EF4444` text, `rgba(239, 68, 68, 0.15)` background)
- **Typography**: Inter font loaded via Google Fonts.
  - Display size (32px, Bold) for Branding and aggregate metric totals.
  - Title size (20px, Semi-Bold) for card headings and modals.
  - Body size (14px, Regular) for table contents, descriptions, and labels.
  - Meta size (12px, Medium) for badge text, headers, and validation errors.
- **Radii**: 4px (`{rounded.sm}`) for status/alert badges, 8px (`{rounded.md}`) for inputs/buttons/table rows, and 12px (`{rounded.lg}`) for cards and modals.
- **Interaction Primitives**: Table rows transition background color on hover (`background-color: rgba(255, 255, 255, 0.02)`).

## Cross-Story Dependencies

- Story 1.1 defines the visual DOM frame and layout containers.
- Story 1.2 builds the `SubscriptionStore` which provides state to the table rows (Story 1.3), metric cards (Story 1.4), and alert badges (Story 1.5).
