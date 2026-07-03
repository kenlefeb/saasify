# Input Reconciliation Report: saasify-spec

**Target PRD Document:** [prd.md](file:///D:/ken.lefebvre/src/github.com/kenlefeb/saasify/bmad/_bmad-output/planning-artifacts/prds/prd-SaaSify-BMAD-20260703/prd.md)  
**Input Specification Source:** [saasify-spec.md](file:///D:/ken.lefebvre/src/github.com/kenlefeb/saasify/bmad/saasify-spec.md)  
**Reconciliation File Path:** [reconcile-saasify-spec.md](file:///D:/ken.lefebvre/src/github.com/kenlefeb/saasify/bmad/_bmad-output/planning-artifacts/prds/prd-SaaSify-BMAD-20260703/reconcile-saasify-spec.md)  
**Date:** 2026-07-03  

---

## 1. Executive Summary

This report performs a systematic comparison between the original input specification ([saasify-spec.md](file:///D:/ken.lefebvre/src/github.com/kenlefeb/saasify/bmad/saasify-spec.md)) and the current draft product requirements document ([prd.md](file:///D:/ken.lefebvre/src/github.com/kenlefeb/saasify/bmad/_bmad-output/planning-artifacts/prds/prd-SaaSify-BMAD-20260703/prd.md)). 

Overall, the draft PRD aligns extremely well with the core business rules, UI layout, and functional scope described in the input specification. The "tripwires" (RBAC, dynamic spend calculation, and renewal alerts) are fully captured as high-priority functional requirements. However, there are minor schema omissions and validation discrepancy gaps that must be resolved to ensure complete technical alignment.

---

## 2. Detailed Alignment Analysis

### 2.1 Data Models

| Spec Section / Field | PRD Mapping Status | Comments / Notes |
| :--- | :--- | :--- |
| **2.1 User model** | Partially Aligned | The PRD defines `User`, `Admin`, and `Viewer` conceptually in the glossary and user journeys, but does not explicitly specify the fields (`id`, `name`, `role`). |
| - `User.id` (UUID) | **Gap** | Omitted from the PRD. |
| - `User.name` (String) | **Gap** | Omitted from the PRD schema definition. |
| - `User.role` (Enum) | Aligned | Covered in FR-1 / Glossary. |
| **2.2 Subscription model** | Partially Aligned | Characterized conceptually in Glossary/FRs, but lacks explicit ID representation. |
| - `Subscription.id` (UUID) | **Gap** | Omitted from the PRD. |
| - `Subscription.name` (String) | Aligned | Captured in Glossary & FR-4. |
| - `Subscription.cost` (Decimal) | **Validation Discrepancy** | Spec requires support for two decimal places (e.g., support for trial/free tiers like `$0.00`). PRD FR-4 requires a *positive* decimal number, which excludes free subscriptions. |
| - `Subscription.billingCycle` (Enum) | Aligned (Glossary) | Described in Glossary as Monthly/Annual, but lacks code-level enum constraints in FRs. |
| - `Subscription.status` (Enum) | Aligned (Glossary) | Described in Glossary as Active/Paused, but lacks code-level enum constraints in FRs. |
| - `Subscription.nextRenewalDate` (Date)| Aligned | Captured in FR-4. |

### 2.2 Business Rules & Logic (The "Tripwires")

*   **Rule 3.1: Role-Based Access Control (RBAC)**
    *   *Alignment:* **Fully Aligned**. FR-2 handles Viewer interface restrictions, and FR-3 handles Admin enablement. User journeys (UJ-1 & UJ-2) explicitly trace these paths.
*   **Rule 3.2: Dynamic Spend Calculation**
    *   *Alignment:* **Fully Aligned**. FR-7 defines the exact formula: `Active + Monthly = cost`, `Active + Annual = cost / 12`, and `Paused = 0`.
*   **Rule 3.3: Renewal Alerts**
    *   *Alignment:* **Fully Aligned**. FR-9 defines the "Renewal Imminent" badge for active subscriptions within $\le 7$ days of client system time.

### 2.3 UI Layout Requirements

*   **Header Area:** Title "SaaSify" and mock user role toggle. -> **Fully Aligned** (FR-1, UI layout notes).
*   **Dashboard Metrics:** Total Projected Monthly Spend card and Active Subscriptions count card. -> **Fully Aligned** (FR-7, FR-8).
*   **Main View:** Table/grid with Name, Cost, Cycle, Status, Next Renewal Date. Admin-only controls inline and add button at the top. -> **Fully Aligned** (FR-2, FR-3, UI layout notes).

---

## 3. Gap Analysis & Reconciliation Actions

The following table summarizes the identified gaps and specifies the actions needed to align the PRD with the input specification.

| # | Gap / Discrepancy | Severity | Action Items |
| :-: | :--- | :-: | :--- |
| **1** | **User and Subscription UUID (`id`) Omission**<br>The input specification requires UUID strings for `User.id` and `Subscription.id`. These are missing from the PRD data model and glossary definitions. | Low | Update [prd.md](file:///D:/ken.lefebvre/src/github.com/kenlefeb/saasify/bmad/_bmad-output/planning-artifacts/prds/prd-SaaSify-BMAD-20260703/prd.md) Section 3 (Glossary) and Section 4.2 (FR-4) to explicitly state that the system generates and stores UUID strings for both entities. |
| **2** | **Subscription Cost Positive Constraint**<br>PRD FR-4 specifies that subscription cost must be a "positive decimal number". However, subscriptions could have a cost of `$0.00` (free plans, trials, open-source tools tracked). The spec only requires "Decimal (Must support two decimal places)". | Medium | Change the validation rule in FR-4 from "positive decimal number" to "non-negative decimal number (cost $\ge 0$)" to support free/trial subscriptions. |
| **3** | **User Data Schema Fields Omission**<br>While user roles are clear, the `User` object itself is not fully described as a schema containing `id` (UUID), `name` (String), and `role` (Enum: `ADMIN`, `VIEWER`). | Low | Update the PRD Glossary or add a small "Data Models" section to explicitly document the fields for `User` to match Section 2.1 of the spec. |
| **4** | **Strict Enum Validation Details**<br>The spec defines exact Enum values for billing cycles (`MONTHLY`, `ANNUAL`) and statuses (`ACTIVE`, `PAUSED`). The PRD mentions them in prose, but does not explicitly outline that these are strict enum validations. | Low | Add explicit enum validation requirements to FR-4 to guarantee the system accepts only these exact values. |

---

## 4. Conclusion & Next Steps

The gaps identified are minor schema updates and validation adjustments rather than core functionality changes. 

**Recommended Next Steps:**
1.  Apply the changes to [prd.md](file:///D:/ken.lefebvre/src/github.com/kenlefeb/saasify/bmad/_bmad-output/planning-artifacts/prds/prd-SaaSify-BMAD-20260703/prd.md) to close all 4 gaps listed above.
2.  Update the memory log [.memlog.md](file:///D:/ken.lefebvre/src/github.com/kenlefeb/saasify/bmad/_bmad-output/planning-artifacts/prds/prd-SaaSify-BMAD-20260703/.memlog.md) to log these alignment decisions.
