# Design Document

## Overview

SaaSify is a full-stack single-page application for tracking software subscriptions. The frontend is a React + TypeScript SPA that fetches data from a Node.js + Express REST API backend. There is no persistent database in the initial implementation — the backend uses an in-memory store seeded with sample data. Role-based access control is enforced both in the UI (hiding/showing controls) and at the API layer (rejecting unauthorized mutation requests).

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Browser                        │
│  ┌───────────────────────────────────────────┐  │
│  │         React + TypeScript SPA            │  │
│  │  ┌─────────────┐  ┌────────────────────┐  │  │
│  │  │   Header    │  │   Role Context     │  │  │
│  │  │ (Role Switch│  │  (ADMIN/VIEWER)    │  │  │
│  │  └─────────────┘  └────────────────────┘  │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │         Metric Cards Row            │  │  │
│  │  │  [Monthly Spend]  [Active Count]    │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │        Subscription Table           │  │  │
│  │  │  (rows + inline Admin controls)     │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │ HTTP (REST)
┌──────────────────────▼──────────────────────────┐
│           Node.js + Express API                 │
│  GET/POST /subscriptions                        │
│  PUT/DELETE /subscriptions/:id                  │
│  In-memory subscription store                   │
└─────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **In-memory store**: No database dependency for initial implementation. The backend stores subscriptions in a JavaScript array. Data is seeded on startup and resets on server restart.
- **Role in request header**: The frontend passes the current role as an `X-User-Role` HTTP header on every mutating request. The backend validates this header before allowing create/update/delete operations.
- **Client-side role state**: The active role is stored in React context. Switching roles is purely a frontend concern — no server-side session is involved.
- **Pure calculation functions**: Spend calculation and renewal alert logic are pure TypeScript functions, making them straightforward to test.

---

## Project Structure

```
saasify/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express app entry point
│   │   ├── routes/
│   │   │   └── subscriptions.ts  # Subscription CRUD routes
│   │   ├── middleware/
│   │   │   └── rbac.ts       # Role-based access middleware
│   │   ├── models/
│   │   │   ├── user.ts       # User type + validation
│   │   │   └── subscription.ts  # Subscription type + validation
│   │   ├── store/
│   │   │   └── subscriptionStore.ts  # In-memory data store
│   │   └── seed.ts           # Seed data
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── main.tsx          # React entry point
    │   ├── App.tsx           # Root component, data fetching
    │   ├── context/
    │   │   └── RoleContext.tsx  # Role state context
    │   ├── components/
    │   │   ├── Header.tsx
    │   │   ├── MetricCards.tsx
    │   │   ├── SubscriptionTable.tsx
    │   │   ├── SubscriptionRow.tsx
    │   │   └── SubscriptionForm.tsx
    │   ├── utils/
    │   │   ├── calculations.ts  # spend + active count
    │   │   └── renewalAlerts.ts # isRenewalImminent
    │   ├── api/
    │   │   └── subscriptionApi.ts  # Fetch wrappers
    │   └── types/
    │       └── index.ts      # Shared TypeScript types
    ├── package.json
    └── tsconfig.json
```

---

## Data Models

### User

```typescript
type Role = 'ADMIN' | 'VIEWER';

interface User {
  id: string;       // UUID v4
  name: string;
  role: Role;
}
```

### Subscription

```typescript
type BillingCycle = 'MONTHLY' | 'ANNUAL';
type Status = 'ACTIVE' | 'PAUSED';

interface Subscription {
  id: string;              // UUID v4
  name: string;
  cost: number;            // stored as decimal, 2 decimal places
  billingCycle: BillingCycle;
  status: Status;
  nextRenewalDate: string; // YYYY-MM-DD format
}
```

### Validation schemas (backend — using Zod)

```typescript
import { z } from 'zod';

export const UserSchema = z.object({
  name: z.string().min(1),
  role: z.enum(['ADMIN', 'VIEWER']),
});

export const SubscriptionSchema = z.object({
  name: z.string().min(1),
  cost: z.number().nonnegative().multipleOf(0.01),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']),
  status: z.enum(['ACTIVE', 'PAUSED']),
  nextRenewalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
```

---

## Backend Components

### Express App (`index.ts`)

Sets up Express with JSON body parsing, CORS for the frontend origin, and mounts the subscription router. Listens on port 3001.

```typescript
import express from 'express';
import cors from 'cors';
import subscriptionRouter from './routes/subscriptions';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/subscriptions', subscriptionRouter);

app.listen(3001, () => console.log('Backend running on port 3001'));
```

### Subscription Store (`subscriptionStore.ts`)

A simple in-memory array with helper functions. UUID generation uses the `uuid` package.

```typescript
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from '../models/subscription';
import { seedData } from '../seed';

let subscriptions: Subscription[] = [...seedData];

export const getAll = (): Subscription[] => [...subscriptions];

export const create = (data: Omit<Subscription, 'id'>): Subscription => {
  const subscription: Subscription = { id: uuidv4(), ...data };
  subscriptions.push(subscription);
  return subscription;
};

export const update = (id: string, data: Partial<Omit<Subscription, 'id'>>): Subscription | null => {
  const index = subscriptions.findIndex(s => s.id === id);
  if (index === -1) return null;
  subscriptions[index] = { ...subscriptions[index], ...data };
  return subscriptions[index];
};

export const remove = (id: string): boolean => {
  const index = subscriptions.findIndex(s => s.id === id);
  if (index === -1) return false;
  subscriptions.splice(index, 1);
  return true;
};
```

### RBAC Middleware (`rbac.ts`)

Reads the `X-User-Role` header and rejects requests without `ADMIN` role.

```typescript
import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const role = req.headers['x-user-role'];
  if (role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden: ADMIN role required' });
    return;
  }
  next();
};
```

### Subscription Routes (`routes/subscriptions.ts`)

```typescript
import { Router } from 'express';
import { z } from 'zod';
import * as store from '../store/subscriptionStore';
import { SubscriptionSchema } from '../models/subscription';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

// GET all subscriptions (public)
router.get('/', (req, res) => {
  res.json(store.getAll());
});

// POST create (admin only)
router.post('/', requireAdmin, (req, res) => {
  const result = SubscriptionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues });
    return;
  }
  const created = store.create(result.data);
  res.status(201).json(created);
});

// PUT update (admin only)
router.put('/:id', requireAdmin, (req, res) => {
  const result = SubscriptionSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues });
    return;
  }
  const updated = store.update(req.params.id, result.data);
  if (!updated) {
    res.status(404).json({ error: 'Subscription not found' });
    return;
  }
  res.json(updated);
});

// DELETE (admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const deleted = store.remove(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Subscription not found' });
    return;
  }
  res.status(204).send();
});

export default router;
```

---

## Frontend Components

### `RoleContext.tsx`

Provides the active role and a setter to all child components. Defaults to `VIEWER`.

```typescript
import React, { createContext, useContext, useState } from 'react';

type Role = 'ADMIN' | 'VIEWER';

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue>({
  role: 'VIEWER',
  setRole: () => {},
});

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('VIEWER');
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
};

export const useRole = () => useContext(RoleContext);
```

### `App.tsx`

Root component. Fetches subscriptions on mount, manages subscription state, passes data down to child components.

```typescript
const App: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions()
      .then(setSubscriptions)
      .catch(() => setError('Could not load subscription data. Please check your connection.'));
  }, []);

  // handlers: handleCreate, handleUpdate, handleDelete
  // ...

  if (error) return <div role="alert">{error}</div>;

  return (
    <RoleProvider>
      <Header />
      <main>
        <MetricCards subscriptions={subscriptions} />
        <SubscriptionTable
          subscriptions={subscriptions}
          onAdd={handleCreate}
          onEdit={handleUpdate}
          onDelete={handleDelete}
        />
      </main>
    </RoleProvider>
  );
};
```

### `Header.tsx`

Renders the application title and role switcher. Reads/writes role from `RoleContext`.

```typescript
const Header: React.FC = () => {
  const { role, setRole } = useRole();
  return (
    <header>
      <h1>SaaSify</h1>
      <label>
        Role:
        <select value={role} onChange={e => setRole(e.target.value as Role)}>
          <option value="VIEWER">VIEWER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </label>
    </header>
  );
};
```

### `MetricCards.tsx`

Renders two metric cards — Total Projected Monthly Spend and Active Subscriptions count.

```typescript
const MetricCards: React.FC<{ subscriptions: Subscription[] }> = ({ subscriptions }) => {
  const monthlySpend = calculateMonthlySpend(subscriptions);
  const activeCount = countActive(subscriptions);
  return (
    <div className="metric-cards">
      <div className="metric-card">
        <h2>Total Projected Monthly Spend</h2>
        <p>{formatUSD(monthlySpend)}</p>
      </div>
      <div className="metric-card">
        <h2>Active Subscriptions</h2>
        <p>{activeCount}</p>
      </div>
    </div>
  );
};
```

### `SubscriptionTable.tsx` and `SubscriptionRow.tsx`

The table renders all subscriptions. When role is `ADMIN`, it renders an "Add Subscription" button above the table and passes `onEdit`/`onDelete` handlers to each row. Each row shows the renewal badge when applicable.

```typescript
const SubscriptionRow: React.FC<RowProps> = ({ subscription, onEdit, onDelete }) => {
  const { role } = useRole();
  const imminent = isRenewalImminent(subscription);
  return (
    <tr>
      <td>{subscription.name}</td>
      <td>{formatUSD(subscription.cost)}</td>
      <td>{subscription.billingCycle}</td>
      <td>{subscription.status}</td>
      <td>
        {subscription.nextRenewalDate}
        {imminent && <span className="badge">Renewal Imminent</span>}
      </td>
      {role === 'ADMIN' && (
        <>
          <td><button onClick={() => onEdit(subscription)}>Edit</button></td>
          <td><button onClick={() => onDelete(subscription.id)}>Delete</button></td>
        </>
      )}
    </tr>
  );
};
```

### `SubscriptionForm.tsx`

A modal/inline form for creating or editing a subscription. Validates required fields client-side before submitting. Sends `X-User-Role: ADMIN` header with every request.

---

## Utility Functions

### `calculations.ts`

```typescript
export const calculateMonthlySpend = (subscriptions: Subscription[]): number => {
  return subscriptions
    .filter(s => s.status === 'ACTIVE')
    .reduce((total, s) => {
      const monthly = s.billingCycle === 'ANNUAL' ? s.cost / 12 : s.cost;
      return total + monthly;
    }, 0);
};

export const countActive = (subscriptions: Subscription[]): number =>
  subscriptions.filter(s => s.status === 'ACTIVE').length;

export const formatUSD = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
```

### `renewalAlerts.ts`

```typescript
export const isRenewalImminent = (
  subscription: Subscription,
  today: Date = new Date()
): boolean => {
  if (subscription.status !== 'ACTIVE') return false;
  const renewal = new Date(subscription.nextRenewalDate);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const renewalMidnight = new Date(renewal.getFullYear(), renewal.getMonth(), renewal.getDate());
  const diffMs = renewalMidnight.getTime() - todayMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
};
```

The `today` parameter is injectable for testability.

---

## API Client (`subscriptionApi.ts`)

```typescript
const BASE_URL = 'http://localhost:3001';

export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  const res = await fetch(`${BASE_URL}/subscriptions`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export const createSubscription = async (
  data: Omit<Subscription, 'id'>,
  role: string
): Promise<Subscription> => {
  const res = await fetch(`${BASE_URL}/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-Role': role },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create');
  return res.json();
};

export const updateSubscription = async (
  id: string,
  data: Partial<Omit<Subscription, 'id'>>,
  role: string
): Promise<Subscription> => {
  const res = await fetch(`${BASE_URL}/subscriptions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-User-Role': role },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update');
  return res.json();
};

export const deleteSubscription = async (id: string, role: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/subscriptions/${id}`, {
    method: 'DELETE',
    headers: { 'X-User-Role': role },
  });
  if (!res.ok) throw new Error('Failed to delete');
};
```

---

## Error Handling

| Scenario | Backend Response | Frontend Behavior |
|---|---|---|
| Invalid enum in create/update | HTTP 400 + error details | Show inline form error |
| Missing required field | HTTP 400 + error details | Show inline form error |
| Mutation without ADMIN role | HTTP 403 | Log warning, no UI action needed (controls hidden for VIEWER) |
| Non-existent id in PUT/DELETE | HTTP 404 | Show toast notification |
| Backend unreachable on load | Network error | Show full-page error message |
| Backend unreachable on mutation | Network error | Show toast notification |

---

## Seed Data

The backend starts with at least 5 sample subscriptions covering all combinations of billingCycle/status values, including at least one with a nextRenewalDate within 7 days of the seeding date, to allow the renewal badge to be visible immediately.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: User schema validity

*For any* valid user creation input, the resulting User object SHALL have an `id` conforming to UUID v4 format, a non-empty `name` string, and a `role` equal to either `ADMIN` or `VIEWER`.

**Validates: Requirements 1.1, 1.2, 1.3**

---

### Property 2: Invalid role rejected with HTTP 400

*For any* string value that is not `"ADMIN"` or `"VIEWER"`, submitting it as the `role` field in a user create or update request SHALL cause the backend to return HTTP 400 with a descriptive error message.

**Validates: Requirements 1.4**

---

### Property 3: Subscription schema validity and round-trip

*For any* valid subscription input (name, non-negative cost with at most two decimal places, valid billingCycle, valid status, valid YYYY-MM-DD date), creating the subscription via `POST /subscriptions` and then retrieving all subscriptions via `GET /subscriptions` SHALL return an array containing the created subscription with all fields preserved exactly.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2**

---

### Property 4: Invalid subscription input rejected with HTTP 400

*For any* subscription input that omits a required field or supplies an invalid enum value for `billingCycle` or `status`, the `POST /subscriptions` and `PUT /subscriptions/:id` endpoints SHALL return HTTP 400 with a descriptive error message.

**Validates: Requirements 2.7**

---

### Property 5: Update round-trip

*For any* existing subscription and any valid partial update payload, calling `PUT /subscriptions/:id` SHALL return HTTP 200 with the updated subscription, and a subsequent `GET /subscriptions` SHALL reflect all updated fields.

**Validates: Requirements 3.3**

---

### Property 6: Delete removes subscription

*For any* existing subscription, calling `DELETE /subscriptions/:id` SHALL return HTTP 204, and a subsequent `GET /subscriptions` SHALL not contain a subscription with that `id`.

**Validates: Requirements 3.4**

---

### Property 7: Non-existent id returns HTTP 404

*For any* UUID string that does not correspond to an existing subscription, both `PUT /subscriptions/:id` and `DELETE /subscriptions/:id` SHALL return HTTP 404 with a descriptive error message.

**Validates: Requirements 3.5**

---

### Property 8: VIEWER role hides mutation controls

*For any* list of subscriptions rendered with the active role set to `VIEWER`, the rendered output SHALL contain no "Add Subscription" button, no "Edit" controls, and no "Delete" controls.

**Validates: Requirements 4.1, 4.2**

---

### Property 9: ADMIN role shows mutation controls for every row

*For any* list of N subscriptions rendered with the active role set to `ADMIN`, the rendered output SHALL contain exactly one "Add Subscription" button, exactly N "Edit" controls, and exactly N "Delete" controls.

**Validates: Requirements 4.3, 4.4**

---

### Property 10: Backend rejects mutations without ADMIN role

*For any* subscription create, update, or delete request where the `X-User-Role` header is absent or set to any value other than `"ADMIN"`, the backend SHALL return HTTP 403.

**Validates: Requirements 4.6**

---

### Property 11: Monthly spend calculation correctness

*For any* list of subscriptions, `calculateMonthlySpend` SHALL return the sum where: each ACTIVE MONTHLY subscription contributes its `cost` directly, each ACTIVE ANNUAL subscription contributes its `cost` divided by 12, and PAUSED subscriptions of either billing cycle contribute zero.

**Validates: Requirements 5.2, 5.3, 5.4**

---

### Property 12: Active subscription count correctness

*For any* list of subscriptions, `countActive` SHALL return an integer equal to the number of subscriptions with `status === "ACTIVE"`.

**Validates: Requirements 6.1**

---

### Property 13: Renewal imminence for active subscriptions

*For any* ACTIVE subscription, `isRenewalImminent` SHALL return `true` if and only if the `nextRenewalDate` is within 0 to 7 calendar days (inclusive) of the provided reference date, where the day difference is calculated in whole calendar days using midnight-normalized dates.

**Validates: Requirements 7.1**

---

### Property 14: PAUSED subscriptions never show renewal badge

*For any* subscription with `status === "PAUSED"`, `isRenewalImminent` SHALL return `false` regardless of the `nextRenewalDate` value.

**Validates: Requirements 7.2**

---

### Property 15: Subscription table row completeness

*For any* subscription, the rendered `SubscriptionRow` SHALL include the subscription's name, cost (formatted as USD currency), billingCycle, status, and nextRenewalDate in the output.

**Validates: Requirements 8.1**

---

### Property 16: Role switch updates all dependent UI

*For any* role value in `{ "ADMIN", "VIEWER" }`, after the Role Switcher is changed to that value, all role-dependent UI elements (mutation controls, metric cards, subscription table) SHALL reflect the new role state without a page reload.

**Validates: Requirements 9.3**
