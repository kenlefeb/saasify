# Adversarial Architecture Review — SaaSify Subscription Tracker

## 1. Verdict: FAIL
The architecture spine, as defined in `ARCHITECTURE-SPINE.md`, contains severe structural ambiguities and lifecycle gaps. While it mandates patterns like a centralized store and localStorage persistence, it fails to specify data semantics, timezone handling, update propagation lifecycles, and synchronization boundaries. Consequently, two components can adhere to every single Architectural Decision (AD) and Consistency Convention to the letter, yet still build and run in a state of mutual incompatibility, causing silent data corruption, race conditions, or display drift.

---

## 2. Incompatible Component Scenarios (Under Strict AD Adherence)

To demonstrate the structural failure of the current spine, we construct two concrete scenarios where individual components fully comply with the specified rules but fail when integrated.

### Scenario A: The Cost Semantics Clash (Shared-Data Shape Conflict)
This scenario demonstrates how components A and B both satisfy the "Cost" convention but corrupt the application state.

* **Component A: `SubscriptionEditor` (Unit A)**
  * **Role:** Modal form to create or edit subscriptions.
  * **Spine Adherence:**
    * **AD-1:** Executes completely client-side in the browser.
    * **AD-2:** Performs all state changes through `SubscriptionStore.add()` and `SubscriptionStore.update()`.
    * **AD-4:** Disables UI and blocks mutations when the active role is `VIEWER`.
    * **Consistency Conventions:** Uses UUIDv4 for IDs, ISO `YYYY-MM-DD` for dates, and parses cost as a Javascript `Number` representing USD (e.g. `120`).
  * **Implementation:** When creating a subscription with a Yearly cycle of $120/year, it saves the raw cycle cost: `cost: 120` and `billingCycle: 'YEARLY'`. This is fully compliant because the spine does not dictate that costs must be normalized or stored in cents.

* **Component B: `DashboardMetricsCard` (Unit B)**
  * **Role:** Computes and displays the projected Monthly Spend.
  * **Spine Adherence:**
    * **AD-1:** Computes spends client-side.
    * **AD-2:** Subscribes to the central store and does not mutate state directly.
    * **Consistency Conventions:** Reads cost as a Javascript `Number` in USD.
  * **Implementation:** To compute monthly spend, it reads the store state and sums the cost properties directly: `subscriptions.reduce((sum, sub) => sum + sub.cost, 0)`. This is compliant because the spine does not specify normalization rules, and the developer assumed the store holds monthly-equivalent numbers.

* **Incompatibility:** When integrated, a $120/year subscription adds $120 to the monthly spend instead of $10. The UI shows highly inflated monthly spends. Both components followed the spine's conventions perfectly, but the spine's silence on cost normalization semantics caused a fatal integration failure.

---

### Scenario B: Timezone Boundary Drift (Date Parsing Mismatch)
This scenario demonstrates how components C and D both satisfy the ISO Date format rule but calculate alerts inconsistently.

* **Component C: `RenewalAlertRow` (Unit C)**
  * **Role:** Renders table rows and flags subscriptions renewing within 7 days.
  * **Spine Adherence:**
    * **AD-1:** Computes alerts in the user's browser.
    * **AD-2:** Subscribes to store updates.
    * **Consistency Conventions:** Dates are processed in ISO `YYYY-MM-DD` string format.
  * **Implementation:** The user enters a renewal date (e.g., `2026-07-10`) via a standard `<input type="date">` which yields local timezone date strings. It saves `"2026-07-10"` to the store.

* **Component D: `AlertSchedulerEngine` (Unit D)**
  * **Role:** Triggers native browser push notifications or badge indicators for upcoming renewals.
  * **Spine Adherence:**
    * **AD-1:** Runs client-side.
    * **AD-2:** Reads state from the central store.
    * **Consistency Conventions:** Uses `YYYY-MM-DD` string dates.
  * **Implementation:** It parses the saved ISO string using JavaScript's native date constructor: `new Date(sub.renewalDate)`. According to ECMAScript specifications, parsing a date-only string like `"2026-07-10"` defaults to UTC midnight (`2026-07-10T00:00:00.000Z`). It then compares this to `new Date()` (representing current local system time).

* **Incompatibility:** For a user in Eastern Standard Time (EST, UTC-5), `2026-07-10T00:00:00.000Z` translates to `2026-07-09T19:00:00-05:00`. Depending on the exact hour the check runs, the subscription will appear to renew a day earlier. The table row alert (using local boundary checks) and the scheduler engine (using UTC parsing) will disagree on which day the subscription actually renews. The alerts will trigger unsynchronized or fail entirely due to JS Date parsing timezone behavior, despite both components storing and reading standard `YYYY-MM-DD` strings.

---

### Scenario C: Multi-Tab LocalStorage Race (Mutation Lifecycle Collision)
This scenario demonstrates how components E and F both comply with store mutation constraints but cause race conditions across browser tabs.

* **Component E: `TabStateSynchronizer` (Unit E)**
  * **Role:** Syncs app state across multiple open tabs.
  * **Spine Adherence:**
    * **AD-2:** Subscribes to the central store.
    * **AD-3:** Synchronizes via `saasify_subscriptions` key in `localStorage`.
  * **Implementation:** It registers a listener on the window: `window.addEventListener('storage', (e) => { if (e.key === 'saasify_subscriptions') store.loadFromStorage(); })`.

* **Component F: `AutoBillingScheduler` (Unit F)**
  * **Role:** On application load, checks for subscriptions with past renewal dates and rolls them forward (incrementing by their billing cycle).
  * **Spine Adherence:**
    * **AD-2:** Calls `SubscriptionStore.update()` to mutate state.
    * **AD-3:** Mutates state on load and lets the store write to `localStorage`.
  * **Implementation:** On page load, it runs a check: if any subscription's renewal date is past, it computes the next date and calls `store.update()`.

* **Incompatibility:** When a user has two tabs open:
  1. Tab 1 loads. `AutoBillingScheduler` runs, identifies an expired subscription, and calls `store.update()`, writing the new state to `localStorage`.
  2. Tab 2 receives the `storage` event. `TabStateSynchronizer` triggers `store.loadFromStorage()`.
  3. However, if Tab 2 is also in its load sequence, its own `AutoBillingScheduler` might have already read the old state from storage, computed its own update, and queued a `store.update()` call.
  4. This results in overlapping synchronous read-modify-write sequences on `localStorage`. One tab's update clobbers the other, or they enter an infinite update loop if their local clocks differ slightly. The central store does not serialize or lock storage writes.

---

## 3. Top Findings & Critical Gaps

### Finding 1: Lack of Currency Semantics & Normalization Constraints
* **Citations:** AD-2 (Centralized Component Store), Consistency Conventions (Cost format)
* **Description:** The spine mandates storing cost as a `Number` in USD but fails to specify if cost must represent the *billing cycle cost* or the *monthly-normalized cost*. This allows different UI components to interpret the `cost` field differently, resulting in distorted dashboard metrics and invalid calculations of total projected spend.

### Finding 2: Timezone Interpretation Ambiguity for ISO Dates
* **Citations:** AD-1 (Pure Client-Side), Consistency Conventions (Data & Formats)
* **Description:** The spine dictates standardizing dates as `YYYY-MM-DD` strings but does not define the timezone context (UTC vs. local system time). Because JavaScript's standard library parses date-only strings as UTC, while local inputs use local system time, components performing calculations (such as the 7-day renewal alert check) will yield mismatched results depending on the user's local timezone.

### Finding 3: Undefined Subscription & Multi-Tab Synchronization Lifecycles
* **Citations:** AD-2 (Centralized Component Store), AD-3 (LocalStorage Data Persistence)
* **Description:** The spine lacks specifications for handling subscription lifecycle states (e.g. how components subscribe to updates) and synchronization across multiple tabs. Listening directly to `storage` events or running auto-update logic on initialization results in race conditions and clobbered updates due to the absence of write-locking or state conflict resolution rules.

### Finding 4: Fragile Client-Side Security Enforcement (Viewer Mode Bypass)
* **Citations:** AD-4 (Client-Side Role-Based View Restrictions)
* **Description:** The rule states that Viewer role mutations must "trigger a console warning and prevent state changes." This implies that the security boundary is purely client-side code execution. Since any user can open the browser console and execute `store.setRole('ADMIN')` or directly edit `localStorage` (`saasify_active_role`), the role restriction is completely bypassable by any local user. The spine lacks a definition of how role modifications are validated or tamper-proofed.

---

## 4. Remediation Recommendations
1. **Define a strict Subscription schema** in the Consistency Conventions, explicitly defining `cost` as `cycleCost` and requiring all metrics calculations to normalize cost using `billingCycle` (`MONTHLY` vs `YEARLY`).
2. **Explicitly mandate local timezone normalization** for all date calculations and formatting to prevent JS native parsing offsets.
3. **Define the Store's Subscription interface** (e.g. event-emitter patterns or custom events) and outline how multi-tab storage modifications should be merged or locked.
4. **Clarify the limits of client-side role simulation**, explicitly stating that it is a UI state simulator and does not serve as a cryptographic or server-backed security boundary.
