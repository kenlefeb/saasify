# Design Specification: SaaSify Subscription Tracker

**Date:** 2026-07-03  
**Status:** Approved  

## 1. Objective
Build a lightweight, high-fidelity, single-page dashboard application to track software subscriptions, monitor monthly expenditures, and enforce simple role-based view permissions using Vite + React + Vanilla CSS.

---

## 2. Architecture & Directory Structure
We use a React Context-based architecture to manage state cleanly without third-party libraries, separating concerns between UI rendering, calculations, and mutations.

```
src/
├── main.jsx                 # Application entry point
├── App.jsx                  # Main layout container and view assembler
├── index.css                # Global styles, variables, typography, and utility classes
├── context/
│   └── SubscriptionContext.jsx  # Context Provider for state, localStorage sync, and calculations
├── components/
│   ├── Header.jsx           # App title and User/Date mock controls
│   ├── MetricsGrid.jsx      # Metrics cards (Spend & Active Counts)
│   ├── SubscriptionTable.jsx # Main grid displaying subscriptions, with Admin controls
│   ├── SubscriptionModal.jsx # Add / Edit subscription form modal (visible to ADMIN only)
│   └── AlertBadge.jsx       # Custom "Renewal Imminent" or other status badges
└── utils/
    └── dateUtils.js         # Date comparison utilities (calculating diff in days)
```

---

## 3. Data Models

### 3.1 User
* `id`: String (UUID)
* `name`: String
* `role`: Enum (`ADMIN`, `VIEWER`)

### 3.2 Subscription
* `id`: String (UUID)
* `name`: String
* `cost`: Decimal (formatted/handled as float/decimal, supporting two decimal places)
* `billingCycle`: Enum (`MONTHLY`, `ANNUAL`)
* `status`: Enum (`ACTIVE`, `PAUSED`)
* `nextRenewalDate`: Date (YYYY-MM-DD)

---

## 4. Business Rules & Logic (The Tripwires)

### 4.1 Role-Based Access Control (RBAC)
* **Rule 1:** Users with `VIEWER` role can view the dashboard metrics and subscription list.
* **Rule 2:** Users with `VIEWER` role must not see or interact with buttons, actions, or modals for creating, editing, or deleting subscriptions.
* **Rule 3:** Users with `ADMIN` role are permitted to execute mutations. The `SubscriptionContext` will guard the actions (`addSubscription`, `updateSubscription`, `deleteSubscription`) internally to verify the role is `ADMIN`.

### 4.2 Dynamic Spend Calculation
* **Rule 1:** A card labeled **"Total Projected Monthly Spend"** will display the computed monthly expense.
* **Calculation Formula:**
  - Iterate through all subscriptions.
  - If a subscription is `ACTIVE` and `MONTHLY`, add its `cost` to the total.
  - If a subscription is `ACTIVE` and `ANNUAL`, divide `cost` by 12 and add the result to the total.
  - If a subscription is `PAUSED`, do not include it.

### 4.3 Renewal Alerts
* **Rule 1:** If an `ACTIVE` subscription's `nextRenewalDate` is within less than or equal to 7 days from the system date (`0 <= diffInDays <= 7`), display a highly visible badge reading **"Renewal Imminent"**.
* **Rule 2 (UX Polish):** If `diffInDays < 0`, label the badge as **"Overdue"** to flag lapsed subscriptions.
* **Rule 3 (Date Override):** The header includes a date-picker control to modify the virtual "current system date", immediately updating all renewal badges.

---

## 5. UI/UX Design & CSS System (Sleek Dark Mode)
The interface is built using standard HTML5 semantic elements and Vanilla CSS, customized with HSL values for a cohesive, modern look.

* **Colors:**
  * Background: Deep space charcoal `hsl(230, 15%, 7%)`
  * Card panels: Glassmorphic translucent `rgba(22, 28, 45, 0.6)` with `backdrop-filter: blur(12px)` and a thin border `rgba(255, 255, 255, 0.05)`
  * Accent branding: Neon violet/indigo `hsl(250, 80%, 65%)`
  * Action items: Electric cyan `hsl(180, 80%, 50%)`
* **Animations:**
  * Subtle hover-scale translations (`transform: translateY(-4px)`) on metrics cards.
  * Pulsing opacity and soft red-orange glow on the "Renewal Imminent" badge.
  * Smooth fade-in and scale-in modal transitions for Add/Edit subscription dialogs.
