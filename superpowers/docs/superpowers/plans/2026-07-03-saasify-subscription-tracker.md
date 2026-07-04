# SaaSify Subscription Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the SaaSify Subscription Tracker: a sleek, dark-mode single-page dashboard application that tracks software subscriptions, calculates dynamic monthly spend, flags imminent renewals, and enforces role-based view controls (ADMIN vs VIEWER).

**Architecture:** Use a central React Context (`SubscriptionContext`) to store subscription data (synced with `localStorage`), active user role, and virtual system date. Components consume this state directly; calculations are memoized, and mutations are guarded by role-based checks.

**Tech Stack:** React 18, Vite, Vitest, React Testing Library, JSDOM, Vanilla CSS.

## Global Constraints
* The application MUST support role-based access control (RBAC): `VIEWER` can only read metrics/lists; `ADMIN` can create, update, and delete.
* Total Projected Monthly Spend calculation: Active + Monthly => cost; Active + Annual => cost / 12; Paused => ignored.
* Alert badge: If Active subscription's `nextRenewalDate` is within 7 days from `currentSystemDate`, show "Renewal Imminent".
* All inputs for cost MUST support two decimal places.
* Standardized timezone-naive date checks using YYYY-MM-DD.

---

### Task 1: Project Initialization & Test Setup

**Files:**
* Modify: `package.json`
* Modify: `vite.config.js`
* Create: `src/setupTests.js`
* Create: `src/dummy.test.js`

**Interfaces:**
* Produces: A working Vitest environment with React Testing Library and JSDOM.

- [ ] **Step 1: Backup current spec and docs files**
Create a backup directory, move the specs, plans, and readme there to avoid getting wiped by create-vite.
Run:
```bash
mkdir -p temp_backup/docs/superpowers/specs temp_backup/docs/superpowers/plans
mv README.md saasify-spec.md temp_backup/
mv docs/superpowers/specs/* temp_backup/docs/superpowers/specs/
mv docs/superpowers/plans/* temp_backup/docs/superpowers/plans/
rm -rf docs
```

- [ ] **Step 2: Initialize Vite project in the current directory**
Run:
```bash
npx -y create-vite@latest ./ --template react --no-interactive --overwrite
```

- [ ] **Step 3: Restore backed up files**
Run:
```bash
mv temp_backup/README.md ./
mv temp_backup/saasify-spec.md ./
mkdir -p docs/superpowers/specs docs/superpowers/plans
mv temp_backup/docs/superpowers/specs/* docs/superpowers/specs/
mv temp_backup/docs/superpowers/plans/* docs/superpowers/plans/
rm -rf temp_backup
```

- [ ] **Step 4: Install testing dependencies**
Run:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 5: Configure Vite for testing**
Write the following content to `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
```

- [ ] **Step 6: Write Test Setup helper**
Write the following content to `src/setupTests.js`:
```javascript
import '@testing-library/jest-dom';
```

- [ ] **Step 7: Create a failing test file to verify test harness**
Write the following content to `src/dummy.test.js`:
```javascript
import { describe, it, expect } from 'vitest';

describe('Dummy test', () => {
  it('fails initially', () => {
    expect(true).toBe(false);
  });
});
```

- [ ] **Step 8: Run Vitest to verify failure**
Run:
```bash
npx vitest run src/dummy.test.js
```
Expected output: 1 failed test.

- [ ] **Step 9: Make dummy test pass**
Change `expect(true).toBe(false)` to `expect(true).toBe(true)` in `src/dummy.test.js`.

- [ ] **Step 10: Run Vitest to verify pass**
Run:
```bash
npx vitest run src/dummy.test.js
```
Expected output: 1 passed test.

- [ ] **Step 11: Cleanup dummy test**
Run:
```bash
rm src/dummy.test.js
```

- [ ] **Step 12: Commit initial setup**
Run:
```bash
git add package.json package-lock.json vite.config.js src/setupTests.js
git commit -m "chore: initialize vite and configure vitest"
```

---

### Task 2: Date Utilities (Renewal Logic Calculations)

**Files:**
* Create: `src/utils/dateUtils.js`
* Create: `src/utils/dateUtils.test.js`

**Interfaces:**
* Produces:
  * `getDaysDifference(dateStr1, dateStr2)`: Returns number of calendar days between `dateStr2` and `dateStr1` (dateStr2 - dateStr1).
  * `isRenewalImminent(renewalDateStr, systemDateStr)`: Returns boolean (`true` if difference is between 0 and 7 days inclusive).

- [ ] **Step 1: Write tests for date utility functions**
Write the following test content to `src/utils/dateUtils.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { getDaysDifference, isRenewalImminent } from './dateUtils';

describe('Date Utilities', () => {
  it('calculates differences in days correctly', () => {
    expect(getDaysDifference('2026-07-03', '2026-07-10')).toBe(7);
    expect(getDaysDifference('2026-07-03', '2026-07-02')).toBe(-1);
    expect(getDaysDifference('2026-07-03', '2026-07-03')).toBe(0);
  });

  it('determines if renewal is imminent (within 0 to 7 days)', () => {
    // 7 days away -> imminent
    expect(isRenewalImminent('2026-07-10', '2026-07-03')).toBe(true);
    // 0 days away (today) -> imminent
    expect(isRenewalImminent('2026-07-03', '2026-07-03')).toBe(true);
    // 8 days away -> not imminent
    expect(isRenewalImminent('2026-07-11', '2026-07-03')).toBe(false);
    // -1 days away (past due) -> not imminent (but past due)
    expect(isRenewalImminent('2026-07-02', '2026-07-03')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**
Run:
```bash
npx vitest run src/utils/dateUtils.test.js
```
Expected output: FAIL (imports do not exist).

- [ ] **Step 3: Write implementation**
Write the following content to `src/utils/dateUtils.js`:
```javascript
export function getDaysDifference(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d2 - d1;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function isRenewalImminent(renewalDateStr, systemDateStr) {
  const diff = getDaysDifference(systemDateStr, renewalDateStr);
  return diff >= 0 && diff <= 7;
}
```

- [ ] **Step 4: Run tests to verify they pass**
Run:
```bash
npx vitest run src/utils/dateUtils.test.js
```
Expected output: PASS.

- [ ] **Step 5: Commit date utilities**
Run:
```bash
git add src/utils/dateUtils.js src/utils/dateUtils.test.js
git commit -m "feat: add date comparison utilities and tests"
```

---

### Task 3: State Context & Calculations

**Files:**
* Create: `src/context/SubscriptionContext.jsx`
* Create: `src/context/SubscriptionContext.test.jsx`

**Interfaces:**
* Produces:
  * `SubscriptionContext` exporting `{ subscriptions, currentUser, setCurrentUser, currentSystemDate, setCurrentSystemDate, totalProjectedMonthlySpend, activeSubscriptionsCount, addSubscription, updateSubscription, deleteSubscription }`

- [ ] **Step 1: Write tests for SubscriptionContext**
Write the following test content to `src/context/SubscriptionContext.test.jsx`:
```javascript
import React, { useContext } from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SubscriptionProvider, SubscriptionContext } from './SubscriptionContext';

const TestComponent = () => {
  const {
    subscriptions,
    currentUser,
    setCurrentUser,
    totalProjectedMonthlySpend,
    activeSubscriptionsCount,
    addSubscription,
    updateSubscription,
    deleteSubscription
  } = useContext(SubscriptionContext);

  return (
    <div>
      <span data-testid="user">{currentUser}</span>
      <span data-testid="spend">{totalProjectedMonthlySpend.toFixed(2)}</span>
      <span data-testid="active-count">{activeSubscriptionsCount}</span>
      <button data-testid="add-btn" onClick={() => addSubscription({
        name: 'New Sub',
        cost: 120.00,
        billingCycle: 'ANNUAL',
        status: 'ACTIVE',
        nextRenewalDate: '2026-07-15'
      })}>Add</button>
      <button data-testid="change-user" onClick={() => setCurrentUser('VIEWER')}>Viewer</button>
    </div>
  );
};

describe('SubscriptionContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('provides default values and calculates spend correctly', () => {
    render(
      <SubscriptionProvider>
        <TestComponent />
      </SubscriptionProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('ADMIN');
    // Pre-seeded: 
    // GitHub Enterprise (Active, Annual, 240/yr = 20/mo)
    // Slack (Active, Monthly, 15/mo)
    // Zoom (Paused, Monthly, 20/mo = 0)
    // Total spend: 20 + 15 = 35.00
    expect(screen.getByTestId('spend')).toHaveTextContent('35.00');
    expect(screen.getByTestId('active-count')).toHaveTextContent('2');
  });

  it('allows ADMIN to add subscriptions and blocks VIEWER from mutating', () => {
    render(
      <SubscriptionProvider>
        <TestComponent />
      </SubscriptionProvider>
    );

    // ADMIN can add
    act(() => {
      screen.getByTestId('add-btn').click();
    });
    // New sub is Active, Annual, 120/yr = 10/mo. Spend becomes 35 + 10 = 45
    expect(screen.getByTestId('spend')).toHaveTextContent('45.00');

    // Switch to VIEWER
    act(() => {
      screen.getByTestId('change-user').click();
    });
    expect(screen.getByTestId('user')).toHaveTextContent('VIEWER');

    // Attempting add as VIEWER should not increase spend (mutation blocked)
    act(() => {
      screen.getByTestId('add-btn').click();
    });
    expect(screen.getByTestId('spend')).toHaveTextContent('45.00');
  });
});
```

- [ ] **Step 2: Run tests to verify failure**
Run:
```bash
npx vitest run src/context/SubscriptionContext.test.jsx
```
Expected output: FAIL.

- [ ] **Step 3: Write implementation**
Write the following content to `src/context/SubscriptionContext.jsx`:
```javascript
import React, { createContext, useState, useEffect, useMemo } from 'react';

export const SubscriptionContext = createContext(null);

const DEFAULT_SUBSCRIPTIONS = [
  { id: '1', name: 'GitHub Enterprise', cost: 240.00, billingCycle: 'ANNUAL', status: 'ACTIVE', nextRenewalDate: '2026-07-08' },
  { id: '2', name: 'Slack', cost: 15.00, billingCycle: 'MONTHLY', status: 'ACTIVE', nextRenewalDate: '2026-07-15' },
  { id: '3', name: 'Zoom', cost: 20.00, billingCycle: 'MONTHLY', status: 'PAUSED', nextRenewalDate: '2026-08-01' }
];

export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem('saasify_subscriptions');
    return saved ? JSON.parse(saved) : DEFAULT_SUBSCRIPTIONS;
  });

  const [currentUser, setCurrentUser] = useState('ADMIN');
  const [currentSystemDate, setCurrentSystemDate] = useState('2026-07-03');

  useEffect(() => {
    localStorage.setItem('saasify_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  const totalProjectedMonthlySpend = useMemo(() => {
    return subscriptions.reduce((total, sub) => {
      if (sub.status !== 'ACTIVE') return total;
      const cost = parseFloat(sub.cost) || 0;
      if (sub.billingCycle === 'MONTHLY') {
        return total + cost;
      } else if (sub.billingCycle === 'ANNUAL') {
        return total + (cost / 12);
      }
      return total;
    }, 0);
  }, [subscriptions]);

  const activeSubscriptionsCount = useMemo(() => {
    return subscriptions.filter(sub => sub.status === 'ACTIVE').length;
  }, [subscriptions]);

  const addSubscription = (newSub) => {
    if (currentUser !== 'ADMIN') return;
    const item = { ...newSub, id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9) };
    setSubscriptions(prev => [...prev, item]);
  };

  const updateSubscription = (id, updatedFields) => {
    if (currentUser !== 'ADMIN') return;
    setSubscriptions(prev => prev.map(sub => sub.id === id ? { ...sub, ...updatedFields } : sub));
  };

  const deleteSubscription = (id) => {
    if (currentUser !== 'ADMIN') return;
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  return (
    <SubscriptionContext.Provider value={{
      subscriptions,
      currentUser,
      setCurrentUser,
      currentSystemDate,
      setCurrentSystemDate,
      totalProjectedMonthlySpend,
      activeSubscriptionsCount,
      addSubscription,
      updateSubscription,
      deleteSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
```

- [ ] **Step 4: Run tests to verify pass**
Run:
```bash
npx vitest run src/context/SubscriptionContext.test.jsx
```
Expected output: PASS.

- [ ] **Step 5: Commit context**
Run:
```bash
git add src/context/SubscriptionContext.jsx src/context/SubscriptionContext.test.jsx
git commit -m "feat: add subscription context with spend calculation and RBAC"
```

---

### Task 4: Global CSS Styling (Sleek Dark Mode)

**Files:**
* Modify: `src/index.css`

**Interfaces:**
* Produces: Visual CSS design variables, styles for buttons, table, dialog modals, header layout, hover effects, and keyframe animations.

- [ ] **Step 1: Write index.css**
Replace content of `src/index.css` with the following:
```css
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: dark;
  color: hsl(0, 0%, 98%);
  background-color: hsl(230, 15%, 7%);

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#root {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, hsl(180, 80%, 50%), hsl(250, 80%, 65%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Header styles */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.controls-card {
  display: flex;
  gap: 1rem;
  background: rgba(22, 28, 45, 0.6);
  backdrop-filter: blur(12px);
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-group label {
  font-size: 0.75rem;
  color: hsl(215, 15%, 70%);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.control-group select,
.control-group input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.35rem 0.5rem;
  border-radius: 4px;
  outline: none;
  font-size: 0.9rem;
}

.control-group select:focus,
.control-group input:focus {
  border-color: hsl(250, 80%, 65%);
}

/* Metrics Row */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: rgba(22, 28, 45, 0.6);
  backdrop-filter: blur(12px);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(100, 100, 255, 0.1);
}

.metric-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: hsl(215, 15%, 70%);
}

.metric-card .value {
  font-size: 2.25rem;
  font-weight: 700;
}

/* Button & UI Actions */
.btn {
  background: hsl(250, 80%, 65%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:hover {
  background: hsl(250, 80%, 70%);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
  background: hsl(0, 80%, 55%);
}

.btn-danger:hover {
  background: hsl(0, 80%, 60%);
}

.btn-group {
  display: flex;
  gap: 0.5rem;
}

/* Subscription Table Container */
.table-container {
  background: rgba(22, 28, 45, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  margin-top: 1rem;
}

.table-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.table-header-row h2 {
  margin: 0;
  font-size: 1.25rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

th {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: hsl(215, 15%, 70%);
  letter-spacing: 0.05em;
}

tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

/* Badges */
.badge {
  display: inline-flex;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.badge-active {
  background: rgba(46, 213, 115, 0.15);
  color: #2ed573;
}

.badge-paused {
  background: rgba(255, 255, 255, 0.1);
  color: hsl(215, 15%, 70%);
}

.badge-imminent {
  background: linear-gradient(135deg, hsl(30, 100%, 50%), hsl(15, 100%, 50%));
  color: white;
  animation: pulse-glow 1.5s infinite ease-in-out;
  box-shadow: 0 0 8px rgba(255, 69, 0, 0.4);
}

.badge-overdue {
  background: rgba(255, 71, 87, 0.15);
  color: #ff4757;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(0.98); }
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: hsl(230, 15%, 10%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 12px 36px rgba(0,0,0,0.5);
  animation: scale-up 0.2s ease-out;
}

@keyframes scale-up {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.form-group label {
  font-size: 0.85rem;
  color: hsl(215, 15%, 70%);
}

.form-group input,
.form-group select {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.6rem;
  border-radius: 6px;
  outline: none;
  font-size: 0.95rem;
}

.form-group input:focus,
.form-group select:focus {
  border-color: hsl(250, 80%, 65%);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
```

- [ ] **Step 2: Remove App.css**
Delete Vite's boilerplate `App.css` file:
Run:
```bash
rm -f src/App.css
```

- [ ] **Step 3: Commit CSS styles**
Run:
```bash
git add src/index.css
git commit -m "style: apply global styling and design tokens"
```

---

### Task 5: Header Component (RBAC & Date Control)

**Files:**
* Create: `src/components/Header.jsx`
* Create: `src/components/Header.test.jsx`

**Interfaces:**
* Consumes: `SubscriptionContext` to read/write `currentUser`, `currentSystemDate`.
* Produces: A header element displaying the application branding and controls to override settings.

- [ ] **Step 1: Write unit tests for Header**
Write the following test content to `src/components/Header.test.jsx`:
```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubscriptionContext } from '../context/SubscriptionContext';
import Header from './Header';

describe('Header Component', () => {
  const mockContext = {
    currentUser: 'ADMIN',
    setCurrentUser: vi.fn(),
    currentSystemDate: '2026-07-03',
    setCurrentSystemDate: vi.fn(),
  };

  it('renders application title and initial settings correctly', () => {
    render(
      <SubscriptionContext.Provider value={mockContext}>
        <Header />
      </SubscriptionContext.Provider>
    );

    expect(screen.getByText('SaaSify')).toBeInTheDocument();
    expect(screen.getByLabelText('User Role')).toHaveValue('ADMIN');
    expect(screen.getByLabelText('System Date')).toHaveValue('2026-07-03');
  });

  it('triggers context state updates on changing role or date', () => {
    render(
      <SubscriptionContext.Provider value={mockContext}>
        <Header />
      </SubscriptionContext.Provider>
    );

    fireEvent.change(screen.getByLabelText('User Role'), { target: { value: 'VIEWER' } });
    expect(mockContext.setCurrentUser).toHaveBeenCalledWith('VIEWER');

    fireEvent.change(screen.getByLabelText('System Date'), { target: { value: '2026-07-10' } });
    expect(mockContext.setCurrentSystemDate).toHaveBeenCalledWith('2026-07-10');
  });
});
```

- [ ] **Step 2: Run test to verify failure**
Run:
```bash
npx vitest run src/components/Header.test.jsx
```
Expected output: FAIL.

- [ ] **Step 3: Implement Header component**
Write the following content to `src/components/Header.jsx`:
```javascript
import React, { useContext } from 'react';
import { SubscriptionContext } from '../context/SubscriptionContext';

export default function Header() {
  const {
    currentUser,
    setCurrentUser,
    currentSystemDate,
    setCurrentSystemDate
  } = useContext(SubscriptionContext);

  return (
    <header>
      <h1 className="gradient-text" style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>SaaSify</h1>
      <div className="controls-card">
        <div className="control-group">
          <label htmlFor="role-select">User Role</label>
          <select 
            id="role-select" 
            value={currentUser} 
            onChange={(e) => setCurrentUser(e.target.value)}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="VIEWER">VIEWER</option>
          </select>
        </div>
        <div className="control-group">
          <label htmlFor="date-select">System Date</label>
          <input 
            type="date" 
            id="date-select" 
            value={currentSystemDate} 
            onChange={(e) => setCurrentSystemDate(e.target.value)} 
          />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Run test to verify pass**
Run:
```bash
npx vitest run src/components/Header.test.jsx
```
Expected output: PASS.

- [ ] **Step 5: Commit Header component**
Run:
```bash
git add src/components/Header.jsx src/components/Header.test.jsx
git commit -m "feat: implement Header component with controls and tests"
```

---

### Task 6: Metrics Grid Component

**Files:**
* Create: `src/components/MetricsGrid.jsx`
* Create: `src/components/MetricsGrid.test.jsx`

**Interfaces:**
* Consumes: `SubscriptionContext` for `totalProjectedMonthlySpend` and `activeSubscriptionsCount`.
* Produces: A top row of metric indicator cards.

- [ ] **Step 1: Write unit tests for MetricsGrid**
Write the following test content to `src/components/MetricsGrid.test.jsx`:
```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SubscriptionContext } from '../context/SubscriptionContext';
import MetricsGrid from './MetricsGrid';

describe('MetricsGrid Component', () => {
  const mockContext = {
    totalProjectedMonthlySpend: 245.50,
    activeSubscriptionsCount: 4,
  };

  it('renders projected spend and active counts accurately', () => {
    render(
      <SubscriptionContext.Provider value={mockContext}>
        <MetricsGrid />
      </SubscriptionContext.Provider>
    );

    expect(screen.getByText('Total Projected Monthly Spend')).toBeInTheDocument();
    expect(screen.getByText('$245.50')).toBeInTheDocument();
    expect(screen.getByText('Active Subscriptions')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**
Run:
```bash
npx vitest run src/components/MetricsGrid.test.jsx
```
Expected: FAIL.

- [ ] **Step 3: Implement MetricsGrid**
Write the following content to `src/components/MetricsGrid.jsx`:
```javascript
import React, { useContext } from 'react';
import { SubscriptionContext } from '../context/SubscriptionContext';

export default function MetricsGrid() {
  const { totalProjectedMonthlySpend, activeSubscriptionsCount } = useContext(SubscriptionContext);

  const formattedSpend = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(totalProjectedMonthlySpend);

  return (
    <div className="metrics-row">
      <div className="metric-card">
        <h3>Total Projected Monthly Spend</h3>
        <div className="value gradient-text">{formattedSpend}</div>
      </div>
      <div className="metric-card">
        <h3>Active Subscriptions</h3>
        <div className="value">{activeSubscriptionsCount}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify pass**
Run:
```bash
npx vitest run src/components/MetricsGrid.test.jsx
```
Expected: PASS.

- [ ] **Step 5: Commit MetricsGrid**
Run:
```bash
git add src/components/MetricsGrid.jsx src/components/MetricsGrid.test.jsx
git commit -m "feat: implement metrics display components and tests"
```

---

### Task 7: AlertBadge and Table View

**Files:**
* Create: `src/components/AlertBadge.jsx`
* Create: `src/components/SubscriptionTable.jsx`
* Create: `src/components/SubscriptionTable.test.jsx`

**Interfaces:**
* Consumes: `SubscriptionContext` to read `subscriptions`, `currentUser`, `currentSystemDate`, and `deleteSubscription`.
* Produces:
  * `AlertBadge`: Component that accepts `renewalDate` and outputs the alert elements.
  * `SubscriptionTable`: Main content box listing subscription rows and rendering action keys if `ADMIN`.

- [ ] **Step 1: Write unit tests for SubscriptionTable and AlertBadge**
Write the following test content to `src/components/SubscriptionTable.test.jsx`:
```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubscriptionContext } from '../context/SubscriptionContext';
import SubscriptionTable from './SubscriptionTable';

describe('SubscriptionTable & AlertBadge', () => {
  const mockContext = {
    subscriptions: [
      { id: '1', name: 'Netflix', cost: 15.00, billingCycle: 'MONTHLY', status: 'ACTIVE', nextRenewalDate: '2026-07-05' },
      { id: '2', name: 'AWS', cost: 1200.00, billingCycle: 'ANNUAL', status: 'ACTIVE', nextRenewalDate: '2026-08-01' }
    ],
    currentUser: 'ADMIN',
    currentSystemDate: '2026-07-03',
    deleteSubscription: vi.fn()
  };

  it('renders subscriptions and action items for ADMIN', () => {
    render(
      <SubscriptionContext.Provider value={mockContext}>
        <SubscriptionTable onOpenModal={vi.fn()} />
      </SubscriptionContext.Provider>
    );

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('$1,200.00')).toBeInTheDocument();
    // Netflix has renewal 2026-07-05 which is 2 days from 2026-07-03. Should show "Renewal Imminent"
    expect(screen.getByText('Renewal Imminent')).toBeInTheDocument();

    // Since role is ADMIN, edit/delete actions should exist
    expect(screen.getAllByRole('button', { name: /edit/i }).length).toBe(2);
    expect(screen.getAllByRole('button', { name: /delete/i }).length).toBe(2);
  });

  it('hides edit/delete/add controls for VIEWER', () => {
    const viewerContext = { ...mockContext, currentUser: 'VIEWER' };
    render(
      <SubscriptionContext.Provider value={viewerContext}>
        <SubscriptionTable onOpenModal={vi.fn()} />
      </SubscriptionContext.Provider>
    );

    // VIEWER must not see action keys or add buttons
    expect(screen.queryByRole('button', { name: /add subscription/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**
Run:
```bash
npx vitest run src/components/SubscriptionTable.test.jsx
```
Expected: FAIL.

- [ ] **Step 3: Implement AlertBadge**
Write the following content to `src/components/AlertBadge.jsx`:
```javascript
import React from 'react';
import { getDaysDifference } from '../utils/dateUtils';

export default function AlertBadge({ renewalDate, systemDate }) {
  const diff = getDaysDifference(systemDate, renewalDate);

  if (diff < 0) {
    return <span className="badge badge-overdue">Overdue</span>;
  }
  if (diff >= 0 && diff <= 7) {
    return <span className="badge badge-imminent">Renewal Imminent</span>;
  }
  return null;
}
```

- [ ] **Step 4: Implement SubscriptionTable**
Write the following content to `src/components/SubscriptionTable.jsx`:
```javascript
import React, { useContext } from 'react';
import { SubscriptionContext } from '../context/SubscriptionContext';
import AlertBadge from './AlertBadge';

export default function SubscriptionTable({ onOpenModal }) {
  const { subscriptions, currentUser, currentSystemDate, deleteSubscription } = useContext(SubscriptionContext);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  return (
    <div className="table-container">
      <div className="table-header-row">
        <h2>Subscriptions</h2>
        {currentUser === 'ADMIN' && (
          <button className="btn" onClick={() => onOpenModal(null)}>
            + Add Subscription
          </button>
        )}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Cost</th>
              <th>Billing Cycle</th>
              <th>Status</th>
              <th>Next Renewal</th>
              <th>Alerts</th>
              {currentUser === 'ADMIN' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {subscriptions.map(sub => (
              <tr key={sub.id}>
                <td style={{ fontWeight: 600 }}>{sub.name}</td>
                <td>{formatCurrency(sub.cost)}</td>
                <td>{sub.billingCycle}</td>
                <td>
                  <span className={`badge ${sub.status === 'ACTIVE' ? 'badge-active' : 'badge-paused'}`}>
                    {sub.status}
                  </span>
                </td>
                <td>{sub.nextRenewalDate}</td>
                <td>
                  {sub.status === 'ACTIVE' && (
                    <AlertBadge renewalDate={sub.nextRenewalDate} systemDate={currentSystemDate} />
                  )}
                </td>
                {currentUser === 'ADMIN' && (
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-secondary" onClick={() => onOpenModal(sub)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => deleteSubscription(sub.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={currentUser === 'ADMIN' ? 7 : 6} style={{ textAlign: 'center', color: 'hsl(215, 15%, 70%)' }}>
                  No subscriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify pass**
Run:
```bash
npx vitest run src/components/SubscriptionTable.test.jsx
```
Expected: PASS.

- [ ] **Step 6: Commit Table Component**
Run:
```bash
git add src/components/AlertBadge.jsx src/components/SubscriptionTable.jsx src/components/SubscriptionTable.test.jsx
git commit -m "feat: implement table listing view and renewal alert badge"
```

---

### Task 8: SubscriptionModal (CRUD Actions Editor)

**Files:**
* Create: `src/components/SubscriptionModal.jsx`
* Create: `src/components/SubscriptionModal.test.jsx`

**Interfaces:**
* Consumes: `SubscriptionContext` functions `addSubscription` and `updateSubscription`.
* Produces: A dialog box with validation rules for adding or editing a subscription.

- [ ] **Step 1: Write tests for SubscriptionModal**
Write the following test content to `src/components/SubscriptionModal.test.jsx`:
```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubscriptionContext } from '../context/SubscriptionContext';
import SubscriptionModal from './SubscriptionModal';

describe('SubscriptionModal Component', () => {
  const mockContext = {
    addSubscription: vi.fn(),
    updateSubscription: vi.fn(),
    currentUser: 'ADMIN'
  };

  it('renders modal form inputs with empty values for adding', () => {
    render(
      <SubscriptionContext.Provider value={mockContext}>
        <SubscriptionModal activeSubscription={null} onClose={vi.fn()} />
      </SubscriptionContext.Provider>
    );

    expect(screen.getByText('Add Subscription')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByLabelText(/cost/i)).toHaveValue(0);
  });

  it('triggers addSubscription action on submit', () => {
    render(
      <SubscriptionContext.Provider value={mockContext}>
        <SubscriptionModal activeSubscription={null} onClose={vi.fn()} />
      </SubscriptionContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Disney+' } });
    fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '14.99' } });
    fireEvent.change(screen.getByLabelText(/next renewal/i), { target: { value: '2026-07-20' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockContext.addSubscription).toHaveBeenCalledWith({
      name: 'Disney+',
      cost: 14.99,
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      nextRenewalDate: '2026-07-20'
    });
  });
});
```

- [ ] **Step 2: Run test to verify failure**
Run:
```bash
npx vitest run src/components/SubscriptionModal.test.jsx
```
Expected: FAIL.

- [ ] **Step 3: Implement SubscriptionModal**
Write the following content to `src/components/SubscriptionModal.jsx`:
```javascript
import React, { useState, useEffect, useContext } from 'react';
import { SubscriptionContext } from '../context/SubscriptionContext';

export default function SubscriptionModal({ activeSubscription, onClose }) {
  const { addSubscription, updateSubscription } = useContext(SubscriptionContext);

  const [name, setName] = useState('');
  const [cost, setCost] = useState(0);
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [status, setStatus] = useState('ACTIVE');
  const [nextRenewalDate, setNextRenewalDate] = useState('');

  useEffect(() => {
    if (activeSubscription) {
      setName(activeSubscription.name);
      setCost(activeSubscription.cost);
      setBillingCycle(activeSubscription.billingCycle);
      setStatus(activeSubscription.status);
      setNextRenewalDate(activeSubscription.nextRenewalDate);
    } else {
      setName('');
      setCost(0);
      setBillingCycle('MONTHLY');
      setStatus('ACTIVE');
      setNextRenewalDate('');
    }
  }, [activeSubscription]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || cost < 0 || !nextRenewalDate) return;

    const data = {
      name,
      cost: parseFloat(parseFloat(cost).toFixed(2)),
      billingCycle,
      status,
      nextRenewalDate
    };

    if (activeSubscription) {
      updateSubscription(activeSubscription.id, data);
    } else {
      addSubscription(data);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{activeSubscription ? 'Edit Subscription' : 'Add Subscription'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="modal-name">Subscription Name</label>
            <input 
              id="modal-name"
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Github Enterprise"
            />
          </div>
          <div className="form-group">
            <label htmlFor="modal-cost">Cost (USD)</label>
            <input 
              id="modal-cost"
              type="number" 
              step="0.01" 
              min="0" 
              required 
              value={cost} 
              onChange={(e) => setCost(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="modal-cycle">Billing Cycle</label>
            <select 
              id="modal-cycle"
              value={billingCycle} 
              onChange={(e) => setBillingCycle(e.target.value)}
            >
              <option value="MONTHLY">MONTHLY</option>
              <option value="ANNUAL">ANNUAL</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="modal-status">Status</label>
            <select 
              id="modal-status"
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="PAUSED">PAUSED</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="modal-date">Next Renewal Date</label>
            <input 
              id="modal-date"
              type="date" 
              required 
              value={nextRenewalDate} 
              onChange={(e) => setNextRenewalDate(e.target.value)} 
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify pass**
Run:
```bash
npx vitest run src/components/SubscriptionModal.test.jsx
```
Expected: PASS.

- [ ] **Step 5: Commit Modal Component**
Run:
```bash
git add src/components/SubscriptionModal.jsx src/components/SubscriptionModal.test.jsx
git commit -m "feat: implement modal form for creating and updating subscriptions"
```

---

### Task 9: App Integration & End-to-End Visual Verification

**Files:**
* Modify: `src/App.jsx`
* Create: `src/App.test.jsx`

**Interfaces:**
* Produces: A unified application compiling header, metric cards, subscription grid, and modals.

- [ ] **Step 1: Write App integration test**
Write the following content to `src/App.test.jsx`:
```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Integration', () => {
  it('renders application structure successfully', () => {
    render(<App />);
    expect(screen.getByText('SaaSify')).toBeInTheDocument();
    expect(screen.getByText('Total Projected Monthly Spend')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**
Run:
```bash
npx vitest run src/App.test.jsx
```
Expected: FAIL.

- [ ] **Step 3: Modify App.jsx**
Replace the content of `src/App.jsx` with the following:
```javascript
import React, { useState } from 'react';
import { SubscriptionProvider } from './context/SubscriptionContext';
import Header from './components/Header';
import MetricsGrid from './components/MetricsGrid';
import SubscriptionTable from './components/SubscriptionTable';
import SubscriptionModal from './components/SubscriptionModal';

function AppContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(null);

  const handleOpenModal = (sub = null) => {
    setActiveSubscription(sub);
    setModalOpen(true);
  };

  return (
    <>
      <Header />
      <main>
        <MetricsGrid />
        <SubscriptionTable onOpenModal={handleOpenModal} />
      </main>
      {modalOpen && (
        <SubscriptionModal 
          activeSubscription={activeSubscription} 
          onClose={() => setModalOpen(false)} 
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <SubscriptionProvider>
      <AppContent />
    </SubscriptionProvider>
  );
}
```

- [ ] **Step 4: Run test to verify pass**
Run:
```bash
npx vitest run src/App.test.jsx
```
Expected: PASS.

- [ ] **Step 5: Run all test suites to confirm full green verification**
Run:
```bash
npx vitest run
```
Expected: All suites PASS.

- [ ] **Step 6: Verify production build output compiles successfully**
Run:
```bash
npm run build
```
Expected: Successful static production build generated under `/dist` folder.

- [ ] **Step 7: Commit final App integration**
Run:
```bash
git add src/App.jsx src/App.test.jsx
git commit -m "feat: complete application integration and add E2E style builds"
```
