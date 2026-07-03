# Specification: "SaaSify" Subscription Tracker

## 1. Objective
A lightweight, single-page dashboard application to track software subscriptions, monitor monthly expenditures, and enforce simple role-based view permissions.

## 2. Data Models

### 2.1 User
* `id`: String (UUID)
* `name`: String
* `role`: Enum (`ADMIN`, `VIEWER`)

### 2.2 Subscription
* `id`: String (UUID)
* `name`: String (e.g., "GitHub Enterprise")
* `cost`: Decimal (Must support two decimal places)
* `billingCycle`: Enum (`MONTHLY`, `ANNUAL`)
* `status`: Enum (`ACTIVE`, `PAUSED`)
* `nextRenewalDate`: Date (YYYY-MM-DD)

---

## 3. Business Rules & Logic (The "Tripwires")

### 3.1 Role-Based Access Control (RBAC)
* **Rule:** A User with the role `VIEWER` `MUST` be able to view the dashboard and the subscription list.
* **Rule:** A User with the role `VIEWER` `MUST NOT` see or interact with any UI controls for creating, editing, or deleting subscriptions. 
* **Rule:** Only a User with the role `ADMIN` `MUST` be allowed to execute mutations (Create, Update, Delete).

### 3.2 Dynamic Spend Calculation
* **Rule:** The dashboard `MUST` display a metric card labeled **"Total Projected Monthly Spend"**.
* **Calculation:** * If a subscription is `ACTIVE` and `MONTHLY`, add `cost` to the total.
  * If a subscription is `ACTIVE` and `ANNUAL`, divide `cost` by 12 and add the result to the total.
  * If a subscription is `PAUSED`, it `MUST NOT` be included in the calculation.

### 3.3 Renewal Alerts
* **Rule:** If an `ACTIVE` subscription's `nextRenewalDate` is within **less than or equal to 7 days** from the current system date, a highly visible visual alert badge reading **"Renewal Imminent"** `MUST` be displayed next to that item in the list.

---

## 4. UI Layout Requirements

### 4.1 Header Area
* Display the application title "SaaSify".
* Display a mock user profile selector to switch between an `ADMIN` user and a `VIEWER` user to test RBAC quickly.

### 4.2 Dashboard Metrics (Top Row)
* Card 1: **Total Projected Monthly Spend** (Formatted as currency).
* Card 2: **Active Subscriptions** (Total count of active items).

### 4.3 Main View (Bottom Area)
* A table or grid displaying all subscriptions showing Name, Cost, Cycle, Status, and Next Renewal Date.
* **Admin-Only Controls:** An "Add Subscription" button at the top of the list, and "Edit/Delete" actions inline with each row.
