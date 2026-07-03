# Requirements Document

## Introduction

SaaSify is a full-stack, single-page dashboard application for tracking software subscriptions, monitoring monthly expenditure, and enforcing role-based access control. The frontend is built with React and TypeScript; the backend is a Node.js + Express REST API. Users can switch between an ADMIN and VIEWER role to control which create/edit/delete operations are available. The dashboard provides real-time spend calculations and renewal alerts to support informed subscription management.

## Glossary

- **App**: The SaaSify single-page dashboard application as a whole.
- **Frontend**: The React + TypeScript single-page application served to the browser.
- **Backend**: The Node.js + Express REST API that persists and serves subscription data.
- **User**: A person interacting with the App, identified by an id (UUID), a name, and a role.
- **Role**: An enum value assigned to a User; either `ADMIN` or `VIEWER`.
- **ADMIN**: A User role that grants full create, read, update, and delete access to subscriptions.
- **VIEWER**: A User role that grants read-only access to the dashboard and subscription list.
- **Subscription**: A tracked software service, identified by id (UUID), name, cost (decimal to two places), billingCycle, status, and nextRenewalDate.
- **BillingCycle**: An enum value on a Subscription; either `MONTHLY` or `ANNUAL`.
- **Status**: An enum value on a Subscription; either `ACTIVE` or `PAUSED`.
- **NextRenewalDate**: A date in `YYYY-MM-DD` format representing when a Subscription next renews.
- **Total Projected Monthly Spend**: The sum of normalized monthly costs for all ACTIVE subscriptions; MONTHLY cost added directly, ANNUAL cost divided by 12; PAUSED subscriptions excluded.
- **Renewal Imminent**: A visual badge displayed on a Subscription row when the NextRenewalDate is within 7 calendar days (inclusive) of the current system date and the Subscription is ACTIVE.
- **Role Switcher**: A UI control in the Header that allows the current session to toggle between ADMIN and VIEWER personas for testing RBAC.
- **Metric Card**: A summary display card in the dashboard top row showing a single aggregate value.
- **Subscription Table**: The main tabular view listing all subscriptions with their attributes and contextual controls.

---

## Requirements

### Requirement 1: Data Model — User

**User Story:** As a developer, I want a well-defined User data model, so that role-based access decisions can be enforced consistently throughout the application.

#### Acceptance Criteria

1. THE Backend SHALL represent each User with a unique `id` field of type UUID string.
2. THE Backend SHALL represent each User with a `name` field of type string.
3. THE Backend SHALL represent each User with a `role` field restricted to the values `ADMIN` or `VIEWER`.
4. IF a request to create or update a User supplies a `role` value other than `ADMIN` or `VIEWER`, THEN THE Backend SHALL reject the request with an HTTP 400 status and a descriptive error message.

---

### Requirement 2: Data Model — Subscription

**User Story:** As a developer, I want a well-defined Subscription data model, so that all subscription attributes are stored and validated consistently.

#### Acceptance Criteria

1. THE Backend SHALL represent each Subscription with a unique `id` field of type UUID string.
2. THE Backend SHALL represent each Subscription with a `name` field of type string.
3. THE Backend SHALL represent each Subscription with a `cost` field that stores a decimal value supporting exactly two decimal places.
4. THE Backend SHALL represent each Subscription with a `billingCycle` field restricted to the values `MONTHLY` or `ANNUAL`.
5. THE Backend SHALL represent each Subscription with a `status` field restricted to the values `ACTIVE` or `PAUSED`.
6. THE Backend SHALL represent each Subscription with a `nextRenewalDate` field stored in `YYYY-MM-DD` format.
7. IF a request to create or update a Subscription omits a required field or supplies an invalid enum value, THEN THE Backend SHALL reject the request with an HTTP 400 status and a descriptive error message.

---

### Requirement 3: REST API — Subscription CRUD

**User Story:** As a frontend developer, I want a REST API for managing subscriptions, so that the Frontend can create, retrieve, update, and delete subscription records.

#### Acceptance Criteria

1. THE Backend SHALL expose a `GET /subscriptions` endpoint that returns all Subscription records as a JSON array.
2. THE Backend SHALL expose a `POST /subscriptions` endpoint that creates a new Subscription from a valid JSON request body and returns the created record with HTTP 201.
3. THE Backend SHALL expose a `PUT /subscriptions/:id` endpoint that updates an existing Subscription and returns the updated record with HTTP 200.
4. THE Backend SHALL expose a `DELETE /subscriptions/:id` endpoint that removes an existing Subscription and returns HTTP 204.
5. IF a `PUT` or `DELETE` request references a Subscription `id` that does not exist, THEN THE Backend SHALL respond with HTTP 404 and a descriptive error message.

---

### Requirement 4: Role-Based Access Control (RBAC)

**User Story:** As a product owner, I want the application to enforce role-based access, so that VIEWER users cannot modify subscription data while ADMIN users have full control.

#### Acceptance Criteria

1. WHILE the active Role is `VIEWER`, THE Frontend SHALL display the subscription list and all Metric Cards in read-only mode.
2. WHILE the active Role is `VIEWER`, THE Frontend SHALL hide all controls for creating, editing, and deleting subscriptions.
3. WHILE the active Role is `ADMIN`, THE Frontend SHALL display an "Add Subscription" button above the Subscription Table.
4. WHILE the active Role is `ADMIN`, THE Frontend SHALL display inline "Edit" and "Delete" action controls for each row in the Subscription Table.
5. WHEN an ADMIN submits a create, update, or delete action, THE Frontend SHALL send the corresponding REST API request to the Backend.
6. IF a mutation request is received by the Backend without a valid ADMIN role indicator, THEN THE Backend SHALL reject the request with HTTP 403.

---

### Requirement 5: Dynamic Spend Calculation

**User Story:** As a user, I want to see the Total Projected Monthly Spend on the dashboard, so that I can understand my current normalized monthly software costs at a glance.

#### Acceptance Criteria

1. THE Frontend SHALL display a Metric Card labeled "Total Projected Monthly Spend" formatted as a currency value in USD.
2. WHEN calculating the Total Projected Monthly Spend, THE Frontend SHALL include each ACTIVE Subscription with a `MONTHLY` BillingCycle by adding its `cost` directly to the total.
3. WHEN calculating the Total Projected Monthly Spend, THE Frontend SHALL include each ACTIVE Subscription with an `ANNUAL` BillingCycle by adding its `cost` divided by 12 to the total.
4. WHEN calculating the Total Projected Monthly Spend, THE Frontend SHALL exclude all Subscriptions whose Status is `PAUSED`.
5. WHEN the set of Subscriptions changes (add, edit, delete, or status toggle), THE Frontend SHALL recalculate and re-render the Total Projected Monthly Spend without requiring a full page reload.

---

### Requirement 6: Active Subscription Count

**User Story:** As a user, I want to see the count of active subscriptions on the dashboard, so that I can quickly understand how many services I am currently using.

#### Acceptance Criteria

1. THE Frontend SHALL display a Metric Card labeled "Active Subscriptions" showing the integer count of all Subscriptions with Status `ACTIVE`.
2. WHEN the set of Subscriptions changes, THE Frontend SHALL recalculate and re-render the Active Subscriptions count without requiring a full page reload.

---

### Requirement 7: Renewal Alerts

**User Story:** As a user, I want to see a "Renewal Imminent" badge on subscriptions renewing within 7 days, so that I can take action before unexpected charges occur.

#### Acceptance Criteria

1. WHEN an ACTIVE Subscription's NextRenewalDate is within 7 calendar days of the current system date (inclusive of today and the renewal date), THE Frontend SHALL display a "Renewal Imminent" badge on that Subscription's row in the Subscription Table.
2. WHILE a Subscription's Status is `PAUSED`, THE Frontend SHALL not display the "Renewal Imminent" badge regardless of the NextRenewalDate value.
3. THE Frontend SHALL evaluate renewal proximity based on the current system date at the time the dashboard is rendered or refreshed.

---

### Requirement 8: Subscription Table

**User Story:** As a user, I want to see all subscriptions in a tabular view, so that I can review the full details of each service in one place.

#### Acceptance Criteria

1. THE Frontend SHALL display a Subscription Table showing the following columns for every Subscription: Name, Cost (formatted as currency), BillingCycle, Status, and NextRenewalDate.
2. WHEN a Subscription qualifies for a Renewal Imminent alert, THE Frontend SHALL render the "Renewal Imminent" badge within that Subscription's row adjacent to the NextRenewalDate value.
3. THE Frontend SHALL display all Subscription records returned by the `GET /subscriptions` endpoint in the Subscription Table.

---

### Requirement 9: Header and Role Switcher

**User Story:** As a developer or tester, I want a header with a role switcher, so that RBAC behavior can be verified quickly without separate authentication flows.

#### Acceptance Criteria

1. THE Frontend SHALL display a persistent header containing the application title "SaaSify".
2. THE Frontend SHALL display a Role Switcher control in the header that allows the user to select between `ADMIN` and `VIEWER` personas.
3. WHEN the Role Switcher value changes, THE Frontend SHALL immediately update all role-dependent UI elements (mutation controls visibility, Metric Cards, Subscription Table) to reflect the newly selected Role without a full page reload.

---

### Requirement 10: Frontend Application Shell

**User Story:** As a user, I want a cohesive single-page application layout, so that all dashboard components are accessible within a single browser view without navigation.

#### Acceptance Criteria

1. THE Frontend SHALL render the entire dashboard within a single HTML page without client-side routing to separate pages.
2. THE Frontend SHALL present the Header at the top, followed by the Metric Cards row, followed by the Subscription Table in a vertical layout.
3. THE Frontend SHALL fetch the initial set of Subscription records from the Backend `GET /subscriptions` endpoint on application load.
4. IF the Backend is unreachable on initial load, THEN THE Frontend SHALL display a user-visible error message indicating that subscription data could not be loaded.
