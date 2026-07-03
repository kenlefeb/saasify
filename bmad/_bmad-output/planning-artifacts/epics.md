---
stepsCompleted:
  - "Step 1: Validate Prerequisites and Extract Requirements"
  - "Step 2: Design Epic List"
  - "Step 3: Generate Epics and Stories"
inputDocuments:
  - "_bmad-output/planning-artifacts/prds/prd-SaaSify-BMAD-20260703/prd.md"
  - "_bmad-output/planning-artifacts/architecture/architecture-SaaSify-BMAD-20260703/ARCHITECTURE-SPINE.md"
---

# SaaSify Subscription Tracker - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for SaaSify Subscription Tracker, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: The system must display a profile selector in the Header Area to toggle between the Admin and Viewer roles. (Toggling roles dynamically updates the UI layout without reload, default role on initial load is Viewer, selected role persists in localStorage).
FR2: The system must hide or disable all controls for creating, editing, and deleting Subscriptions when the active role is Viewer. (Hides "Add Subscription" button and inline Edit/Delete buttons).
FR3: The system must display all creation, editing, and deletion controls when the active role is Admin. (Add, Edit, and Delete actions are interactive).
FR4: An Admin can add a new Subscription by providing a Name (non-blank), Cost (decimal >= 0 with up to two decimal places), Billing Cycle (strictly MONTHLY or ANNUAL), Status (strictly ACTIVE or PAUSED), and Next Renewal Date (valid date in YYYY-MM-DD format). System generates a unique UUIDv4 string for ID. Form validation errors must be presented as inline error messages.
FR5: An Admin can edit any field of an existing Subscription. Same validation rules as FR4. Edits immediately trigger recalculation of dashboard metrics.
FR6: An Admin can delete a Subscription from the list. Standard window.confirm() dialog is prompted before deletion. Deletion immediately updates dashboard metrics.
FR7: The system must calculate and display a metric card labeled "Total Projected Monthly Spend" formatted as currency (USD). Calculations: Active Monthly cost + (Active Annual cost / 12); Paused items add 0.
FR8: The system must calculate and display a metric card showing the total count of Active subscriptions (Paused items are excluded).
FR9: The system must display a highly visible visual alert badge reading "Renewal Imminent" next to any Active subscription whose Next Renewal Date is within 0 to 7 days relative to client's current local system date. Overdue, paused, or >7 days dates do not display the badge.

### NonFunctional Requirements

NFR1: 100% accuracy in Projected Monthly Spend calculation as verified by unit tests matching annual-to-monthly conversions.
NFR2: 100% enforcement of role-based visibility, ensuring Viewers have no access to mutation controls or client-side mutation functions.
NFR3: Pure client-side SPA (HTML, CSS, JS) with LocalStorage persistence to keep deployment overhead zero. Static host only.
NFR4: UI quality and premium aesthetics take priority over micro-performance optimization.

### Additional Requirements

- Centralized Component Store: All state mutations (Create, Update, Delete, Role Toggle) must execute through the central `SubscriptionStore` class API. Components must subscribe to the Store for state updates and must not mutate the state array directly.
- Local Timezone Date Parsing: Manually parse YYYY-MM-DD strings using `const [y, m, d] = str.split('-')` and construct using local boundaries `new Date(y, m - 1, d)` to prevent 1-day timezone parsing drift.
- Cross-Tab Synchronization: Sync state to localStorage using `saasify_subscriptions` and `saasify_active_role` keys. On storage event, check if parsed value differs from current in-memory store to prevent multi-tab write loops.
- Dynamic Seeding Dates: Mock data seeding (Netflix - Active/Monthly, GitHub Enterprise - Active/Annual with renewal within 7 days, Adobe CC - Paused) must dynamically offset renewal dates relative to current client system date to guarantee alert badges are visible on first load.
- HTTP UUIDv4 Fallback: Secure context `crypto.randomUUID()` used for IDs. If executed in non-secure HTTP contexts, the app must fall back to a standard math-random-based UUID generator.
- Minimal SPA static structure: Single-page application consisting of `index.html`, `index.css`, and `app.js`.

### UX Design Requirements

No UX design specification was provided for this project (Not applicable).

### FR Coverage Map

FR1: Epic 2 - Mock RBAC header selector and persistent role switching.
FR2: Epic 2 - Disables/hides all create/edit/delete buttons for Viewers.
FR3: Epic 2 - Enables all interactive CRUD controls for Admins.
FR4: Epic 2 - Form modal with inline validations and UUIDv4 generation.
FR5: Epic 2 - Editing subscription details and updating store metrics.
FR6: Epic 2 - Deleting subscription with a window.confirm() dialog.
FR7: Epic 1 - Metric calculation (Monthly + Annual/12; Paused is 0) and card rendering.
FR8: Epic 1 - Metric calculation of active subscriptions and card rendering.
FR9: Epic 1 - Alert badge logic and dynamic next renewal date seeding.

## Epic List

### Epic 1: Dashboard Core & Subscription Metrics
Set up the premium single-page dashboard structure, color theme, and typography. Initialize the centralized component store (SubscriptionStore) with pre-seeded mock subscription data and dynamic local timezone date calculations to display the active subscription list, key metric cards (Projected Monthly Spend and Active Subscriptions Count), and "Renewal Imminent" badges.
**FRs covered:** FR7, FR8, FR9.

### Epic 2: Role Switcher & Subscription Management (CRUD)
Add simulated role-based access control (RBAC) to toggle between Admin and Viewer roles in the header. Enable Admins to add, edit, and delete subscriptions with full form validations and browser-confirmed deletions, while restricting Viewer access. Synchronize all state and role configurations across browser tabs via localStorage.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6.

## Epic 1: Dashboard Core & Subscription Metrics

Set up the premium single-page dashboard structure, color theme, and typography. Initialize the centralized component store (SubscriptionStore) with pre-seeded mock subscription data and dynamic local timezone date calculations to display the active subscription list, key metric cards (Projected Monthly Spend and Active Subscriptions Count), and "Renewal Imminent" badges.

### Story 1.1: Core Single-Page Layout & Premium Styling

As a Viewer/Admin,
I want a modern, single-page grid layout using high-quality typography, responsive containers, and subtle animations,
So that I can inspect my dashboard in an interface that feels premium and clean.

**Acceptance Criteria:**

**Given** a browser viewport
**When** the user loads `index.html`
**Then** a header is visible displaying the title "SaaSify" and a mock user role indicator (defaulting to "Viewer")
**And** a metrics row with two metric cards ("Total Projected Monthly Spend" and "Active Subscriptions") is displayed below the header
**And** a main panel containing a subscriptions list table is styled with a curated palette (e.g. deep blue/indigo theme) and Outfit or Inter typography.

### Story 1.2: Centralized Store & Localized Mock Seeding

As a Viewer,
I want the application to initialize a centralized state store and automatically seed it with mock subscriptions when no saved data is found,
So that the application does not load onto a blank dashboard on first use.

**Acceptance Criteria:**

**Given** no prior data exists in `localStorage` under `saasify_subscriptions`
**When** the application is loaded
**Then** the central `SubscriptionStore` is instantiated in `app.js`
**And** it is pre-seeded with 3 to 4 mock subscription entries (e.g. Netflix, Adobe CC, GitHub Enterprise)
**And** renewal dates for imminent mock items are dynamically set relative to the current system date (e.g., current date + 3 days) to guarantee alert badges will render
**And** IDs for seeded items are generated using `crypto.randomUUID()` with a safe math-random-based UUID string generator fallback if secure context is missing.

### Story 1.3: Active Subscriptions List & Timezone-Aware Dates

As a Viewer,
I want to inspect all subscription records in a clean table showing Name, Cost, Billing Cycle, Status, and Next Renewal Date without date shifting,
So that I can view an accurate list of active and paused tools.

**Acceptance Criteria:**

**Given** active and paused subscriptions exist in the store
**When** the table is rendered
**Then** columns for Name, Cost (formatted in USD, e.g. `$14.99`), Billing Cycle (`MONTHLY` or `ANNUAL`), Status (`ACTIVE` or `PAUSED`), and Next Renewal Date are displayed
**And** dates must be parsed into local timezone boundaries manually (using `str.split('-')` and `new Date(y, m-1, d)`) to prevent 1-day timezone parsing drift.

### Story 1.4: Projected Spend and Active Count Metric Cards

As a Viewer,
I want to see calculated summaries of my monthly expenditures and the total count of active tools,
So that I have an immediate overview of my active software overhead.

**Acceptance Criteria:**

**Given** active and paused subscriptions exist in the store
**When** the metrics cards are calculated
**Then** the "Total Projected Monthly Spend" card displays the sum of active subscription monthly equivalents:
  - `cost` if cycle is `MONTHLY`
  - `cost / 12` if cycle is `ANNUAL`
  - `0` if status is `PAUSED`
**And** the "Active Subscriptions" card displays the count of subscriptions with status `ACTIVE`
**And** any changes in subscription data cause these metrics to update automatically in the DOM.

### Story 1.5: Renewal Imminent Alert Badges

As a Viewer,
I want a highly visible alert badge next to subscriptions that are renewing within the next 7 days,
So that I can take action before I am automatically billed.

**Acceptance Criteria:**

**Given** an active subscription exists in the store
**When** its `nextRenewalDate` is within `0` to `7` days in the future relative to the client's current local date
**Then** a crimson "Renewal Imminent" badge is rendered next to the subscription item
**And** if the subscription is paused or has a renewal date in the past (overdue) or more than 7 days in the future, the badge is not shown.

## Epic 2: Role Switcher & Subscription Management (CRUD)

Add simulated role-based access control (RBAC) to toggle between Admin and Viewer roles in the header. Enable Admins to add, edit, and delete subscriptions with full form validations and browser-confirmed deletions, while restricting Viewer access. Synchronize all state and role configurations across browser tabs via localStorage.

### Story 2.1: Mock RBAC Role Selector

As a Viewer/Admin,
I want a dropdown or toggle in the Header to switch between Admin and Viewer roles,
So that I can easily test and simulate different permission views immediately in the UI.

**Acceptance Criteria:**

**Given** the application is loaded
**When** the user checks the Header
**Then** a selector dropdown is displayed with option values "Admin" and "Viewer"
**And** the selected role is persisted in `localStorage` under `saasify_active_role`, defaulting to "Viewer" on initial load
**When** the user changes the active option
**Then** the store updates its active role state and dynamically updates the UI layout without a full page reload.

### Story 2.2: Viewer Interface Restrictions

As a Viewer,
I want all subscription creation, editing, and deletion controls to be hidden, and store mutations to be blocked,
So that I cannot accidentally or intentionally perform modifications on the data.

**Acceptance Criteria:**

**Given** the active role is "Viewer"
**When** the interface renders
**Then** the "Add Subscription" button is not visible
**And** the inline "Edit" and "Delete" buttons in the subscriptions table rows are not visible
**When** an attempt is made to execute a store mutation (Create, Update, or Delete) while under the "Viewer" role (e.g. via console execution)
**Then** the store blocks the operation, logs a console warning, and the state remains unchanged.

### Story 2.3: Admin CRUD Action Controls & Confirmation Dialog

As an Admin,
I want to see and interact with all creation, editing, and deletion buttons, with a confirmation step for deletions,
So that I can manage tracking items and prevent accidental deletions.

**Acceptance Criteria:**

**Given** the active role is "Admin"
**When** the interface renders
**Then** the "Add Subscription" button is visible and active
**And** inline "Edit" and "Delete" action buttons are rendered and active in each table row
**When** the Admin clicks the "Delete" button for a subscription
**Then** a browser-native confirmation prompt (`window.confirm()`) is displayed
**And** if confirmed, the subscription is deleted from the store, data is updated in `localStorage`, and the table and dashboard metrics recalculate immediately
**And** if cancelled, no change occurs.

### Story 2.4: Create and Edit Modal Form with Inline Validations

As an Admin,
I want a clean modal form to enter or edit subscription fields with strict validation checks,
So that I can submit accurate and complete tracking data.

**Acceptance Criteria:**

**Given** the active role is "Admin"
**When** the Admin clicks "Add Subscription" or an inline "Edit" button
**Then** a modal overlay opens displaying input fields: Name, Cost, Billing Cycle (`MONTHLY` or `ANNUAL`), Status (`ACTIVE` or `PAUSED`), and Next Renewal Date
**And** if editing, the inputs are pre-populated with the subscription's existing values
**When** the Admin clicks "Save", the store validates that:
  - Name is not blank
  - Cost is a non-negative decimal (>= 0)
  - Billing Cycle is strictly `MONTHLY` or `ANNUAL`
  - Status is strictly `ACTIVE` or `PAUSED`
  - Next Renewal Date is in `YYYY-MM-DD` format
**And** if any validations fail, clear inline error messages are shown next to the respective inputs and submission is blocked
**And** if validations pass, the store saves the record (generating a UUIDv4 on creation if secure context is available, fallback if not), synchronizes to `localStorage`, closes the modal, and updates all UI elements immediately.

### Story 2.5: LocalStorage Cross-Tab Synchronization

As a Viewer/Admin opening the app in multiple tabs,
I want data and role state changes in one tab to automatically synchronize to other tabs without page reload loops,
So that my view is always up-to-date.

**Acceptance Criteria:**

**Given** the application is open in multiple browser tabs
**When** a `storage` event triggers a change in `saasify_subscriptions` or `saasify_active_role`
**Then** the store listener intercepts the event
**And** it compares the serialized value of the storage key against its current in-memory serialization
**And** if they differ, the store updates its in-memory state and rerenders the UI components
**And** if they are identical, it does nothing, preventing infinite cross-tab write loops.
