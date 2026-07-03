---
title: SaaSify Subscription Tracker
status: draft
created: 2026-07-03
updated: 2026-07-03
---

# PRD: SaaSify Subscription Tracker

## 0. Document Purpose
This document specifies the requirements for SaaSify, a lightweight subscription tracking dashboard. It outlines the core features, user roles (Admin and Viewer), spend calculations, and renewal alerts. This PRD is structured to serve as the definitive specification for design, architecture, and development teams, with glossary-anchored vocabulary, structured user journeys, and explicit assumptions.

## 1. Vision
SaaSify is a lightweight, single-page dashboard application that gives teams and individuals immediate visibility into their software subscriptions. By providing a clear breakdown of monthly expenditures, upcoming renewals, and toggleable role-based access, SaaSify eliminates the hidden costs of forgotten or unmanaged software. It aims to be simple, fast, and visually clean, requiring zero backend configuration in its initial version.

## 2. Target User

### 2.1 Jobs To Be Done
* **Monitor Spend:** I want to see the total monthly projected expenditure of my software tools so that I can manage my operational budget.
* **Avoid Surprise Renewals:** I want a highly visible alert for subscriptions renewing soon so that I can decide whether to cancel or keep them.
* **Test RBAC Simply:** I want to toggle between Admin and Viewer roles immediately in the UI so that I can verify view and edit permissions without logging out and back in.

### 2.2 Non-Users (v1)
* **Enterprise Procurement Teams:** SaaSify v1 does not handle formal invoice generation, purchase orders, or organizational approval workflows.
* **Automated Cancellation Seekers:** SaaSify v1 only tracks subscriptions; it does not log into third-party accounts to automatically cancel subscriptions.

### 2.3 Key User Journeys

* **UJ-1. Viewer inspects the dashboard spend and subscriptions**
  * **Persona + context:** Ken, a Viewer user, wants to review the total subscription spend for the team.
  * **Entry state:** Authenticated as a Viewer on the SaaSify dashboard page.
  * **Path:**
    1. Ken views the "Total Projected Monthly Spend" card in the dashboard metrics.
    2. Ken checks the "Active Subscriptions" count card.
    3. Ken scrolls down to inspect the list of subscriptions in the main view table.
    4. Ken notices the "Renewal Imminent" badge next to subscriptions due in less than or equal to 7 days.
  * **Climax:** Ken receives a clear, accurate, and up-to-date breakdown of the team's spend without seeing any edit or creation controls.
  * **Resolution:** Ken logs off or closes the browser knowing the spend status.

* **UJ-2. Admin adds and modifies subscriptions**
  * **Persona + context:** Winston, an Admin user, wants to add a new team subscription (e.g. GitHub Enterprise) and pause a trial that is no longer needed.
  * **Entry state:** Authenticated as an Admin on the SaaSify dashboard page.
  * **Path:**
    1. Winston clicks the "Add Subscription" button at the top of the subscription list.
    2. Winston fills out the modal form with Name, Cost, Billing Cycle (Monthly), Status (Active), and Next Renewal Date.
    3. Winston submits the form; the dashboard metrics immediately update.
    4. Winston spots a trial subscription in the table, clicks "Edit", and changes its Status to "Paused".
  * **Climax:** Winston sees the total spend recalculate to exclude the paused subscription.
  * **Resolution:** Winston logs off with all changes safely persisted.

---

## 3. Glossary
* **User** — A registered operator of SaaSify. Can be either an Admin or a Viewer.
* **Admin** — A User role with full permissions to view the dashboard and execute mutations (Create, Update, Delete) on Subscriptions.
* **Viewer** — A User role with read-only permissions to view the dashboard and Subscription list.
* **Subscription** — A software subscription tracked in SaaSify, characterized by a Name, Cost, Billing Cycle, Status, and Next Renewal Date.
* **Projected Monthly Spend** — The calculated monthly cost of all active Subscriptions, adjusted by their billing cycle.
* **Active** — A Subscription status indicating it is currently running and paid for.
* **Paused** — A Subscription status indicating it is temporarily suspended and should not incur cost.
* **Billing Cycle** — The frequency of subscription payments, either Monthly or Annual.
* **Next Renewal Date** — The date when the subscription next renews (YYYY-MM-DD).
* **Renewal Imminent** — A visual status badge displayed for active Subscriptions whose renewal date is within 7 days.

---

## 4. Features

### 4.1 Role-Based Access Control (RBAC) & User Selection
**Description:** SaaSify supports role-based views using a mock user profile selector in the header, allowing users to switch roles instantly. [ASSUMPTION: SaaSify is built as a pure client-side web app using HTML/JS/CSS with localStorage persistence to keep deployment overhead zero.]

**Functional Requirements:**
#### FR-1: Role Selector
The system must display a profile selector in the Header Area to toggle between the Admin and Viewer roles.
* **Consequences:**
  - Toggling roles dynamically updates the UI layout without a full page reload.

#### FR-2: Viewer Interface Restrictions
The system must hide or disable all controls for creating, editing, and deleting Subscriptions when the active role is Viewer.
* **Consequences:**
  - The "Add Subscription" button is not visible.
  - The inline "Edit" and "Delete" action buttons in the subscription list are not visible.

#### FR-3: Admin Action Enablement
The system must display all creation, editing, and deletion controls when the active role is Admin.
* **Consequences:**
  - The "Add Subscription" button is fully interactive.
  - The inline "Edit" and "Delete" actions are interactive.

---

### 4.2 Subscription Management (CRUD)
**Description:** Allows Admins to perform Create, Read, Update, and Delete operations on Subscriptions.

**Functional Requirements:**
#### FR-4: Create Subscription
An Admin can add a new Subscription by providing a Name, Cost, Billing Cycle, Status, and Next Renewal Date.
* **Consequences:**
  - Names must not be blank.
  - Cost must be a positive decimal number with up to two decimal places [ASSUMPTION: US Dollar ($) is the default currency used for all spend calculations and UI formatting.]
  - Next Renewal Date must be a valid date in YYYY-MM-DD format.

#### FR-5: Update Subscription
An Admin can edit any field of an existing Subscription.
* **Consequences:**
  - Validation rules from FR-4 apply during editing.
  - Updates immediately trigger recalculation of dashboard metrics.

#### FR-6: Delete Subscription
An Admin can delete a Subscription from the list.
* **Consequences:**
  - The system displays a browser confirmation prompt before deletion [ASSUMPTION: A standard browser confirm dialog is used for subscription deletion confirmations.]
  - Deletion removes the Subscription and updates the dashboard metrics immediately.

---

### 4.3 Spend Analytics & Dashboard Metrics
**Description:** Displays summary cards representing monthly projected expenditure and active subscription counts.

**Functional Requirements:**
#### FR-7: Projected Monthly Spend Calculation
The system must calculate and display a metric card labeled "Total Projected Monthly Spend" formatted as currency.
* **Calculation:**
  - If a Subscription is Active and Monthly, add its full cost.
  - If a Subscription is Active and Annual, divide its cost by 12 and add the result.
  - If a Subscription is Paused, add 0 (exclude it from the calculation).

#### FR-8: Active Subscriptions Count
The system must calculate and display a metric card showing the total count of Active items.
* **Consequences:**
  - Paused Subscriptions are excluded from this count.

---

### 4.4 Renewal Alerts
**Description:** Alerts users when a subscription is due for renewal soon.

**Functional Requirements:**
#### FR-9: Renewal Imminent Alert Badge
The system must display a highly visible visual alert badge reading "Renewal Imminent" next to any Active Subscription whose Next Renewal Date is less than or equal to 7 days from the system date.
* **Consequences:**
  - The client system date is used as the current date reference [ASSUMPTION: The client system time is the source of truth for the current date to determine renewal alert badges.]
  - Paused Subscriptions do not display the badge even if their renewal date is within 7 days.

---

## 5. Non-Goals (Explicit)
* **Multi-Currency Support:** Support for currencies other than USD is deferred to v2.
* **External Integration:** Integration with financial accounts, payment systems, or calendar APIs is out of scope.
* **User Authentication System:** There is no true authentication or backend user accounts; user role switching is mocked client-side.

---

## 6. MVP Scope

### 6.1 In Scope
* A single-page dashboard UI built with HTML, Javascript, and Vanilla CSS.
* LocalStorage state persistence for subscription entries.
* Mock user selector in the header to swap between Admin and Viewer roles.
* Dashboard metrics: Total Projected Monthly Spend and Active Subscriptions count.
* List table displaying all subscriptions and inline Admin controls.
* "Add/Edit Subscription" modal form for Admin users.
* Delete confirmation dialog.
* "Renewal Imminent" badges next to qualifying active subscriptions.

### 6.2 Out of Scope for MVP
* Actual user authentication (login, signup, password resets).
* Database persistence (all data is localized to browser LocalStorage).
* Subscription renewal notification emails or system notifications.

---

## 7. Success Metrics

### Primary
* **SM-1**: 100% accuracy in Projected Monthly Spend calculation as verified by unit tests matching annual-to-monthly conversions. Validates FR-7.
* **SM-2**: 100% enforcement of role-based visibility, ensuring Viewers have no access to mutation buttons or endpoints. Validates FR-2, FR-3.

### Counter-metrics (do not optimize)
* **SM-C1**: Page Load Speed. While we want a fast app, we should not sacrifice UI readability and high-quality styling to save fractional milliseconds on load.

---

## 8. Open Questions
1. **Initial Seed Data:** Should the application start with a pre-seeded set of mock subscriptions so the dashboard doesn't look empty on the first load? (Recommended: Yes, we should seed 3-4 subscriptions, including one that triggers the "Renewal Imminent" alert).
2. **Alert Trigger Customization:** Should the 7-day threshold for "Renewal Imminent" alerts be configurable in the UI, or is a hardcoded 7-day rule sufficient for MVP? (Recommended: Hardcode 7 days to keep MVP scope minimal).

---

## 9. Assumptions Index
1. **Client-side Web App:** SaaSify is built as a pure client-side web app using HTML/JS/CSS with localStorage persistence to keep deployment overhead zero.
2. **Default Currency:** US Dollar ($) is the default currency used for all spend calculations and UI formatting.
3. **Current Date Source:** The client system time is the source of truth for the current date to determine renewal alert badges.
4. **Delete Confirmation Flow:** A standard browser confirm dialog is used for subscription deletion confirmations.

---

## Adapt-In Menu

### Aesthetic and Tone
* **Design System:** Use modern typography (e.g. Outfit or Inter via Google Fonts), soft drop shadows, rounded corners, clean borders, and smooth transitions (hover effects).
* **Color Palette:** Curated dark mode or elegant deep blue/indigo theme. Green for active badges, orange/yellow for Paused, and red/crimson for "Renewal Imminent".
* **Layout:** Single-page grid layout. Top header with title and user toggle. Metrics row below the header. Main table/grid taking up the remaining space.

### Information Architecture
* **Dashboard Layout:**
  - Header: SaaSify title + Mock User Role Select dropdown.
  - Metrics Grid: Two cards (Total Projected Monthly Spend, Active Subscriptions).
  - Main Panel: Table with columns (Name, Cost, Billing Cycle, Status, Next Renewal Date, Actions). Add Button positioned top-right of the table.
