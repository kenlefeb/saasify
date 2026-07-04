# Implementation Plan: SaaSify Subscription Tracker

## Overview

Full-stack implementation of SaaSify using React + TypeScript (frontend) and Node.js + Express (backend). The backend uses an in-memory store with Zod validation; the frontend is a single-page React app with role-based access control enforced both in the UI and at the API layer.

## Tasks

- [x] 1. Set up project scaffolding and shared types
  - [x] 1.1 Initialize backend Node.js + TypeScript project
    - Create `backend/` directory with `package.json`, `tsconfig.json`
    - Install dependencies: `express`, `cors`, `uuid`, `zod` and dev deps: `typescript`, `ts-node`, `@types/express`, `@types/cors`, `@types/uuid`, `@types/node`
    - _Requirements: 2.1–2.6, 3.1–3.5_
  - [x] 1.2 Initialize frontend React + TypeScript + Vite project
    - Create `frontend/` directory with Vite scaffold (`npm create vite@latest`)
    - Install dependencies: `react`, `react-dom`, dev deps: `typescript`, `@types/react`, `@types/react-dom`
    - _Requirements: 10.1, 10.2_
  - [x] 1.3 Define shared TypeScript types in `frontend/src/types/index.ts`
    - Define `Role`, `BillingCycle`, `Status`, `User`, `Subscription` interfaces matching the design
    - _Requirements: 1.1–1.3, 2.1–2.6_

- [x] 2. Implement the backend data layer and models
  - [x] 2.1 Create backend data models and Zod schemas in `backend/src/models/`
    - Write `user.ts` with `UserSchema` (Zod) and `User` type
    - Write `subscription.ts` with `SubscriptionSchema` (Zod) and `Subscription` type
    - _Requirements: 1.1–1.4, 2.1–2.7_
  - [ ]* 2.2 Write property test for User schema validity (Property 1)
    - **Property 1: User schema validity**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  - [ ]* 2.3 Write property test for invalid role rejection (Property 2)
    - **Property 2: Invalid role rejected with HTTP 400**
    - **Validates: Requirements 1.4**
  - [ ]* 2.4 Write property test for invalid subscription input rejection (Property 4)
    - **Property 4: Invalid subscription input rejected with HTTP 400**
    - **Validates: Requirements 2.7**
  - [x] 2.5 Create seed data in `backend/src/seed.ts`
    - Define at least 5 sample subscriptions covering all billingCycle/status combinations
    - Include at least one subscription with `nextRenewalDate` within 7 days of seeding date
    - _Requirements: (seed data to support all requirements)_
  - [x] 2.6 Implement in-memory subscription store in `backend/src/store/subscriptionStore.ts`
    - Implement `getAll`, `create`, `update`, `remove` functions using a seeded array
    - _Requirements: 3.1–3.5_

- [x] 3. Implement the backend API routes and middleware
  - [x] 3.1 Create RBAC middleware in `backend/src/middleware/rbac.ts`
    - Implement `requireAdmin` that reads `X-User-Role` header and returns HTTP 403 if not `ADMIN`
    - _Requirements: 4.6_
  - [ ]* 3.2 Write property test for backend RBAC rejection (Property 10)
    - **Property 10: Backend rejects mutations without ADMIN role**
    - **Validates: Requirements 4.6**
  - [x] 3.3 Implement subscription CRUD routes in `backend/src/routes/subscriptions.ts`
    - Wire `GET /`, `POST /`, `PUT /:id`, `DELETE /:id` using the store and RBAC middleware
    - Apply Zod validation; return 400 on invalid input, 404 on missing id
    - _Requirements: 3.1–3.5, 1.4, 2.7_
  - [ ]* 3.4 Write property test for subscription schema round-trip (Property 3)
    - **Property 3: Subscription schema validity and round-trip**
    - **Validates: Requirements 2.1–2.6, 3.1, 3.2**
  - [ ]* 3.5 Write property test for update round-trip (Property 5)
    - **Property 5: Update round-trip**
    - **Validates: Requirements 3.3**
  - [ ]* 3.6 Write property test for delete removes subscription (Property 6)
    - **Property 6: Delete removes subscription**
    - **Validates: Requirements 3.4**
  - [ ]* 3.7 Write property test for non-existent id returning HTTP 404 (Property 7)
    - **Property 7: Non-existent id returns HTTP 404**
    - **Validates: Requirements 3.5**
  - [x] 3.8 Create Express app entry point in `backend/src/index.ts`
    - Set up Express with JSON body parsing, CORS for `http://localhost:5173`, mount subscription router on `/subscriptions`, listen on port 3001
    - _Requirements: 3.1–3.5_

- [x] 4. Checkpoint — backend complete
  - Ensure all backend tests pass, the server starts on port 3001, and all CRUD endpoints respond correctly. Ask the user if any questions arise.

- [x] 5. Implement frontend utility functions
  - [x] 5.1 Implement spend and count utilities in `frontend/src/utils/calculations.ts`
    - Implement `calculateMonthlySpend`, `countActive`, and `formatUSD`
    - _Requirements: 5.1–5.4, 6.1_
  - [ ]* 5.2 Write property test for monthly spend calculation (Property 11)
    - **Property 11: Monthly spend calculation correctness**
    - **Validates: Requirements 5.2, 5.3, 5.4**
  - [ ]* 5.3 Write property test for active subscription count (Property 12)
    - **Property 12: Active subscription count correctness**
    - **Validates: Requirements 6.1**
  - [x] 5.4 Implement renewal alert utility in `frontend/src/utils/renewalAlerts.ts`
    - Implement `isRenewalImminent` with injectable `today` parameter using midnight-normalized date arithmetic
    - _Requirements: 7.1–7.3_
  - [ ]* 5.5 Write property test for renewal imminence (Property 13)
    - **Property 13: Renewal imminence for active subscriptions**
    - **Validates: Requirements 7.1**
  - [ ]* 5.6 Write property test for PAUSED subscriptions never showing renewal badge (Property 14)
    - **Property 14: PAUSED subscriptions never show renewal badge**
    - **Validates: Requirements 7.2**

- [x] 6. Implement frontend API client
  - [x] 6.1 Create API client in `frontend/src/api/subscriptionApi.ts`
    - Implement `fetchSubscriptions`, `createSubscription`, `updateSubscription`, `deleteSubscription`
    - Pass `X-User-Role` header on all mutating requests
    - _Requirements: 3.1–3.5, 4.5_

- [x] 7. Implement frontend React components
  - [x] 7.1 Create `RoleContext.tsx` in `frontend/src/context/`
    - Implement `RoleProvider` and `useRole` hook with default role `VIEWER`
    - _Requirements: 4.1–4.5, 9.2, 9.3_
  - [x] 7.2 Create `Header.tsx` component
    - Render application title "SaaSify" and a role switcher `<select>` reading/writing from `RoleContext`
    - _Requirements: 9.1, 9.2, 9.3_
  - [x] 7.3 Create `MetricCards.tsx` component
    - Render "Total Projected Monthly Spend" and "Active Subscriptions" metric cards using utility functions
    - _Requirements: 5.1, 6.1_
  - [x] 7.4 Create `SubscriptionRow.tsx` component
    - Render a table row with Name, Cost (USD), BillingCycle, Status, NextRenewalDate columns
    - Display "Renewal Imminent" badge when `isRenewalImminent` returns true
    - Show Edit/Delete buttons only when role is `ADMIN`
    - _Requirements: 4.3, 4.4, 7.1, 7.2, 8.1, 8.2_
  - [ ]* 7.5 Write property test for subscription table row completeness (Property 15)
    - **Property 15: Subscription table row completeness**
    - **Validates: Requirements 8.1**
  - [x] 7.6 Create `SubscriptionForm.tsx` component
    - Implement modal/inline form for creating and editing subscriptions
    - Client-side validation of all required fields before submission
    - _Requirements: 4.3, 4.5, 2.7_
  - [x] 7.7 Create `SubscriptionTable.tsx` component
    - Render all subscription rows; show "Add Subscription" button when role is `ADMIN`
    - _Requirements: 4.2, 4.3, 8.1, 8.3_
  - [ ]* 7.8 Write property test for VIEWER role hiding mutation controls (Property 8)
    - **Property 8: VIEWER role hides mutation controls**
    - **Validates: Requirements 4.1, 4.2**
  - [ ]* 7.9 Write property test for ADMIN role showing mutation controls (Property 9)
    - **Property 9: ADMIN role shows mutation controls for every row**
    - **Validates: Requirements 4.3, 4.4**

- [x] 8. Wire everything together in `App.tsx`
  - [x] 8.1 Implement root `App.tsx` component
    - Fetch subscriptions on mount via `fetchSubscriptions`; display full-page error if backend unreachable
    - Implement `handleCreate`, `handleUpdate`, `handleDelete` handlers that call the API and update state
    - Render `RoleProvider` wrapping `Header`, `MetricCards`, `SubscriptionTable` in vertical layout
    - _Requirements: 10.1–10.4, 4.5, 5.5, 6.2_
  - [ ]* 8.2 Write property test for role switch updating all dependent UI (Property 16)
    - **Property 16: Role switch updates all dependent UI**
    - **Validates: Requirements 9.3**

- [x] 9. Final checkpoint — Ensure all tests pass
  - Run all frontend and backend tests. Verify the full application renders correctly with the backend running. Ask the user if any questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests (Properties 1–16) map directly to the Correctness Properties in the design document
- The backend uses Zod for runtime validation; the frontend mirrors types without Zod
- The `today` parameter in `isRenewalImminent` makes it fully testable without mocking `Date`
- CORS is configured for `http://localhost:5173` (Vite default dev port)
- The in-memory store resets on server restart — no persistence is required for this implementation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3"] },
    { "id": 2, "tasks": ["2.1", "2.5"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "2.6", "5.1", "5.4", "6.1", "7.1"] },
    { "id": 4, "tasks": ["3.1", "5.2", "5.3", "5.5", "5.6"] },
    { "id": 5, "tasks": ["3.3", "3.8", "7.2", "7.3"] },
    { "id": 6, "tasks": ["3.2", "3.4", "3.5", "3.6", "3.7", "7.4", "7.6"] },
    { "id": 7, "tasks": ["7.5", "7.7"] },
    { "id": 8, "tasks": ["7.8", "7.9", "8.1"] },
    { "id": 9, "tasks": ["8.2"] }
  ]
}
```
