# Architecture Reconciliation Report: SaaSify Subscription Tracker

## 1. Executive Summary

This report performs a systematic input reconciliation between the **SaaSify Subscription Tracker PRD** ([prd.md](file:///D:/ken.lefebvre/src/github.com/kenlefeb/saasify/bmad/_bmad-output/planning-artifacts/prds/prd-SaaSify-BMAD-20260703/prd.md)) and the draft **Architecture Spine** ([ARCHITECTURE-SPINE.md](file:///D:/ken.lefebvre/src/github.com/kenlefeb/saasify/bmad/_bmad-output/planning-artifacts/architecture/architecture-SaaSify-BMAD-20260703/ARCHITECTURE-SPINE.md)). 

Overall, there is strong alignment between the business requirements outlined in the PRD (client-side execution, mock role-based access, and LocalStorage persistence) and the draft Architecture Spine's Design Paradigm (Component-Store SPA). However, several key functional details and business logic constraints specified in the PRD have not been fully captured in the Architecture Spine. Resolving these gaps will prevent divergent implementation patterns.

---

## 2. Alignment Assessment

| PRD Section / Requirement | Architecture Spine Alignment | Status | Notes |
| :--- | :--- | :--- | :--- |
| **FR-1: Role Selector** & **FR-2/3: Role Restrictions** | Aligned with **AD-4** (Role-Based View Restrictions) and **Capability Map**. | **Fully Aligned** | UI role toggling and localStorage persistence are mapped. |
| **FR-4: Create Subscription** | Partially Aligned with **AD-2** and **Conventions**. | **Partially Aligned** | General CRUD operations are in the Store, but validation constraints are missing in the Spine. |
| **FR-5: Update Subscription** | Aligned with **AD-2** (Centralized Store) and **Capability Map**. | **Fully Aligned** | Immediate recalculation and state mutation mapped through Store. |
| **FR-6: Delete Subscription** | Aligned with **AD-2** (Centralized Store) and **Capability Map**. | **Partially Aligned** | Confirmation prompt mentioned in PRD and spine assumptions, but not formally mapped. |
| **FR-7 & FR-8: Spend Metrics** | Aligned with **Capability Map** (`SubscriptionStore` calculations). | **Partially Aligned** | Standard calculations mapped, but specific division logic (annual to monthly) and status checks are omitted. |
| **FR-9: Renewal Alerts** | Aligned with **Capability Map** (UI Row Render, Date Utils). | **Partially Aligned** | Boundary conditions (0 to 7 days, excluding paused/overdue) are not explicitly codified. |
| **MVP Scope 6.1 (Mock Data Seeding)** | Aligned with **AD-3** (LocalStorage Data Persistence). | **Partially Aligned** | Seeding trigger condition mapped, but exact seed data structure and date dynamics are missing. |

---

## 3. Identified Gaps

We have identified five key gaps between the PRD requirements and the draft Architecture Spine. Codifying these in the Architecture Spine will ensure developer agents build the application in strict alignment with product requirements.

### Gap 1: Form Validation Rules & Input Constraints (FR-4 & FR-5)
* **Description:** The PRD requires strict validation on subscription inputs: non-blank `name`, non-negative decimal `cost` (supporting up to two decimal places), strict Enum validation (`MONTHLY`/`ANNUAL` billing cycles, `ACTIVE`/`PAUSED` status), and `YYYY-MM-DD` date validation.
* **Architecture spine state:** The spine defines uppercase Enums and date formatting in "Consistency Conventions", but does not specify validation responsibilities.
* **Risk:** Developer agents might implement ad-hoc form validation or bypass model-level validation within the `SubscriptionStore`, resulting in inconsistent UI error states or corrupted localStorage data.
* **Proposed Resolution:** Add a clear validation invariant to the Spine (or under Consistency Conventions) stating that the `SubscriptionStore` must validate all inputs prior to mutation and throw clear, catchable validation errors, and that UI components must render these as inline or native validation errors.

### Gap 2: Dynamic Mock Data Seeding (MVP Scope 6.1)
* **Description:** The PRD specifies pre-seeding 3-4 subscriptions (e.g., Netflix - Active/Monthly, GitHub Enterprise - Active/Annual with renewal within 7 days, Adobe CC - Paused) only when the localStorage key is completely absent.
* **Architecture spine state:** **AD-3** specifies *when* seeding occurs (when the key is completely absent), but does not specify *what* is seeded or *how* to handle the relative dates.
* **Risk:** If a static renewal date (e.g., `2026-07-05`) is used for the "GitHub Enterprise" mock subscription, the "Renewal Imminent" badge will stop appearing once the system date passes that date, rendering the feature untestable in future runs.
* **Proposed Resolution:** Codify that the mock seeding logic must calculate the "Next Renewal Date" dynamically relative to the current system date at seed-time (e.g., `currentDate + 3 days` for GitHub Enterprise) so that the renewal badge is always visible on first load regardless of when the app is initialized.

### Gap 3: Exclusion of Paused and Overdue Subscriptions from Renewal Alerts (FR-9)
* **Description:** The PRD requires that a "Renewal Imminent" badge only display for active subscriptions whose renewal date is within 0 to 7 days in the future. It explicitly states that *paused* or *overdue* (renewal date in the past) subscriptions must not display the badge.
* **Architecture spine state:** The spine mentions "Renewal Alert Calculation" in the Capability Map, but does not capture this boundary logic.
* **Risk:** A developer might write a simple date-difference check (e.g. `diff <= 7`) that shows badges for paused subscriptions or displays renewal alerts for subscriptions whose renewal dates have already passed.
* **Proposed Resolution:** Under Consistency Conventions or a dedicated AD, define the exact renewal alert invariant: `Active && 0 <= nextRenewalDate - systemDate <= 7 days`.

### Gap 4: Integration of Delete Confirmation Flow (FR-6)
* **Description:** The PRD specifies that a confirmation dialog (standard browser `confirm`) must be prompted before deleting a subscription.
* **Architecture spine state:** The spine relies on a brief assumption tag in AD-1 but does not represent this user confirmation contract in the main Store API design or Capability Map.
* **Risk:** Deletions could happen instantly without confirmation if the developer assumes the store handles deletions silently and only builds components React-style.
* **Proposed Resolution:** Add the delete confirmation flow to the Capability Map or under a UI interaction rule in the Spine, explicitly referencing standard browser `confirm`.

### Gap 5: Metrics and Calculation Invariants (FR-7 & FR-8)
* **Description:** The PRD defines the math for `Projected Monthly Spend` (Monthly = full cost, Annual = cost / 12, Paused = 0) and `Active Subscriptions Count` (Paused is excluded).
* **Architecture spine state:** The calculations are listed in the Capability Map but the specific mathematical transformations (e.g. division by 12, exclusion of paused) are not formalized as code rules.
* **Risk:** Division by 12 or exclusion of paused status could be missed or implemented incorrectly in different components, leading to state rendering drifts.
* **Proposed Resolution:** Formalize the spend calculation logic under the state conventions in the Spine to ensure consistent implementation in `SubscriptionStore`.

---

## 4. Actionable Recommendations for Updating the Spine

To resolve these gaps, the following updates should be made to [ARCHITECTURE-SPINE.md](file:///D:/ken.lefebvre/src/github.com/kenlefeb/saasify/bmad/_bmad-output/planning-artifacts/architecture/architecture-SaaSify-BMAD-20260703/ARCHITECTURE-SPINE.md):

1. **Add Form Validation Invariant**: Add a new sub-clause to **AD-2 (Centralized Component Store)** or a new rule:
   > **Input Validation Rule:** The `SubscriptionStore` must reject any create/update mutations if: Name is blank, Cost is negative, or dates are not in YYYY-MM-DD. All enums must be strictly validated.
2. **Add Relative Date Seeding Rule**: Add a rule to **AD-3 (LocalStorage Data Persistence)**:
   > **Relative Mock Seeding Rule:** Seed data must be generated dynamically so that the "GitHub Enterprise" mock subscription's renewal date is set to `currentDate + 3 days` (ensuring the "Renewal Imminent" badge displays on first load).
3. **Formalize Spent & Alert Math**: Update the **Consistency Conventions** table to include a section on Calculations:
   - **Projected Spend**: Sum of: `cost` for active monthly subscriptions, `cost / 12` for active annual subscriptions, and `0` for paused subscriptions.
   - **Renewal Imminent**: Display badge if and only if `status === ACTIVE` and `0 <= (nextRenewalDate - systemDate) <= 7 days`.
4. **UI Confirm Rule**: Add a UI rule for deletion confirmation in the **Consistency Conventions** or Capability Map.
