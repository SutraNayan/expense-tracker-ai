# Expense Tracker + CSV Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a minimal React expense tracker from scratch with a working CSV data export button.

**Architecture:** Single-page React + Vite app. State lives in `App.jsx`, persisted to `localStorage`. A pure JS utility handles CSV generation via the Blob + anchor download pattern. No backend, no routing, no dependencies beyond React.

**Tech Stack:** React 18, Vite 5, Vitest (for utility tests only)

---

### Task 1: Create feature branch and scaffold Vite app

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx` (all via scaffold)

**Step 1: Create and checkout the feature branch**

```bash
git checkout -b feature-data-export-v1
```

Expected: `Switched to a new branch 'feature-data-export-v1'`

**Step 2: Scaffold the Vite + React app**

```bash
npm create vite@latest . -- --template react
```

When prompted "Current directory is not empty. Remove existing files and continue?" — choose **Yes** (the only file present is `docs/`, which will be preserved by git).

**Step 3: Install dependencies**

```bash
npm install
```

**Step 4: Install Vitest for unit testing**

```bash
npm install --save-dev vitest
```

**Step 5: Add test script to package.json**

In `package.json`, add `"test": "vitest run"` to the `"scripts"` section:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run"
}
```

**Step 6: Verify the app runs**

```bash
npm run dev
```

Expected: Vite dev server starts, prints a localhost URL. Open it — default Vite + React page should appear. Stop with Ctrl+C.

**Step 7: Commit scaffold**

```bash
git add -A
git commit -m "chore: scaffold React + Vite app with Vitest"
```

---

### Task 2: Create CSV export utility (TDD)

**Files:**
- Create: `src/utils/csvExport.js`
- Create: `src/utils/csvExport.test.js`

**Step 1: Write the failing tests**

Create `src/utils/csvExport.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { buildCsvString } from './csvExport'

describe('buildCsvString', () => {
  it('returns header row when expenses is empty', () => {
    const result = buildCsvString([])
    expect(result).toBe('Date,Category,Amount,Description')
  })

  it('returns one data row for a single expense', () => {
    const expenses = [
      { date: '2026-02-20', category: 'Food', amount: 12.5, description: 'Lunch' }
    ]
    const result = buildCsvString(expenses)
    expect(result).toBe('Date,Category,Amount,Description\n2026-02-20,Food,12.5,Lunch')
  })

  it('wraps fields containing commas in double quotes', () => {
    const expenses = [
      { date: '2026-02-20', category: 'Food', amount: 5, description: 'Coffee, large' }
    ]
    const result = buildCsvString(expenses)
    expect(result).toContain('"Coffee, large"')
  })

  it('wraps fields containing double quotes and escapes them', () => {
    const expenses = [
      { date: '2026-02-20', category: 'Other', amount: 10, description: 'Say "hello"' }
    ]
    const result = buildCsvString(expenses)
    expect(result).toContain('"Say ""hello"""')
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: 4 tests FAIL with "Cannot find module './csvExport'"

**Step 3: Implement `buildCsvString`**

Create `src/utils/csvExport.js`:

```js
function escapeField(value) {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

export function buildCsvString(expenses) {
  const header = 'Date,Category,Amount,Description'
  if (expenses.length === 0) return header

  const rows = expenses.map(({ date, category, amount, description }) =>
    [date, category, amount, description].map(escapeField).join(',')
  )
  return [header, ...rows].join('\n')
}

export function downloadExpensesCSV(expenses) {
  const csv = buildCsvString(expenses)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const today = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `expenses-${today}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: 4 tests PASS

**Step 5: Commit**

```bash
git add src/utils/csvExport.js src/utils/csvExport.test.js
git commit -m "feat: add CSV export utility with tests"
```

---

### Task 3: Create localStorage helper

**Files:**
- Create: `src/utils/expenseStorage.js`

No test file needed — this is a thin wrapper around `localStorage`; logic lives in the caller.

**Step 1: Create `src/utils/expenseStorage.js`**

```js
const KEY = 'expenses'

export function loadExpenses() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveExpenses(expenses) {
  localStorage.setItem(KEY, JSON.stringify(expenses))
}
```

**Step 2: Commit**

```bash
git add src/utils/expenseStorage.js
git commit -m "feat: add localStorage expense persistence utility"
```

---

### Task 4: Create AddExpenseForm component

**Files:**
- Create: `src/components/AddExpenseForm.jsx`

**Step 1: Create `src/components/AddExpenseForm.jsx`**

```jsx
import { useState } from 'react'

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Other']

export default function AddExpenseForm({ onAdd }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: CATEGORIES[0],
    amount: '',
    description: '',
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount || isNaN(Number(form.amount))) return
    onAdd({
      id: crypto.randomUUID(),
      date: form.date,
      category: form.category,
      amount: Number(form.amount),
      description: form.description,
    })
    setForm({ ...form, amount: '', description: '' })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
      <input type="date" name="date" value={form.date} onChange={handleChange} required />
      <select name="category" value={form.category} onChange={handleChange}>
        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>
      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
        min="0"
        step="0.01"
        required
        style={{ width: '100px' }}
      />
      <input
        type="text"
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        style={{ width: '200px' }}
      />
      <button type="submit">Add Expense</button>
    </form>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/AddExpenseForm.jsx
git commit -m "feat: add AddExpenseForm component"
```

---

### Task 5: Create Dashboard component

**Files:**
- Create: `src/components/Dashboard.jsx`

**Step 1: Create `src/components/Dashboard.jsx`**

```jsx
import AddExpenseForm from './AddExpenseForm'
import { downloadExpensesCSV } from '../utils/csvExport'

export default function Dashboard({ expenses, onAdd }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Expense Tracker</h1>
        <button onClick={() => downloadExpensesCSV(expenses)}>
          Export Data
        </button>
      </div>

      <AddExpenseForm onAdd={onAdd} />

      {expenses.length === 0 ? (
        <p>No expenses yet. Add one above.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Date', 'Category', 'Amount', 'Description'].map(h => (
                <th key={h} style={{ textAlign: 'left', borderBottom: '2px solid #ccc', padding: '8px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{e.date}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{e.category}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>${e.amount.toFixed(2)}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{e.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Dashboard.jsx
git commit -m "feat: add Dashboard component with expense table and export button"
```

---

### Task 6: Wire up App.jsx

**Files:**
- Modify: `src/App.jsx` (replace scaffold content entirely)
- Modify: `src/index.css` (replace scaffold content with minimal reset)

**Step 1: Replace `src/App.jsx`**

```jsx
import { useState } from 'react'
import Dashboard from './components/Dashboard'
import { loadExpenses, saveExpenses } from './utils/expenseStorage'

export default function App() {
  const [expenses, setExpenses] = useState(loadExpenses)

  function handleAdd(expense) {
    const updated = [...expenses, expense]
    setExpenses(updated)
    saveExpenses(updated)
  }

  return <Dashboard expenses={expenses} onAdd={handleAdd} />
}
```

**Step 2: Replace `src/index.css` with a minimal reset**

```css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #f9f9f9; color: #222; }
button { cursor: pointer; padding: 6px 14px; }
input, select { padding: 6px 8px; }
```

**Step 3: Delete unused scaffold files**

```bash
rm src/App.css src/assets/react.svg public/vite.svg
```

Update `index.html` to remove the Vite favicon reference — change:
```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```
to:
```html
<link rel="icon" href="data:," />
```

**Step 4: Verify the app works end-to-end**

```bash
npm run dev
```

Open the browser:
1. Add a few expenses using the form
2. Verify they appear in the table
3. Refresh the page — expenses should still be there (localStorage)
4. Click "Export Data" — a CSV file should download with the correct columns

**Step 5: Run tests one final time**

```bash
npm test
```

Expected: 4 tests PASS

**Step 6: Final commit**

```bash
git add src/App.jsx src/index.css index.html
git commit -m "feat: wire up App with localStorage state and render Dashboard"
```

---

### Task 7: Clean up and final commit summary

**Step 1: Confirm branch state**

```bash
git log --oneline
```

Expected output (most recent first):
```
feat: wire up App with localStorage state and render Dashboard
feat: add Dashboard component with expense table and export button
feat: add AddExpenseForm component
feat: add localStorage expense persistence utility
feat: add CSV export utility with tests
chore: scaffold React + Vite app with Vitest
docs: add data export v1 design document
```

**Step 2: Confirm all tests pass**

```bash
npm test
```

Expected: 4 tests PASS, 0 failures

Done. The feature branch `feature-data-export-v1` is ready.
