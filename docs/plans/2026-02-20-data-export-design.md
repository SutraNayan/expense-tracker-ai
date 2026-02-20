# Data Export Feature Design — v1

**Date:** 2026-02-20
**Branch:** feature-data-export-v1
**Stack:** React + Vite
**Storage:** localStorage

## Overview

Build a minimal expense tracker from scratch with a CSV data export feature. The export button lives on the main dashboard and triggers an immediate browser download — no server required.

## Architecture

Single-page app, no routing. State is owned by `App.jsx` and persisted to `localStorage`.

```
src/
  App.jsx              ← root: loads/saves expenses to localStorage
  components/
    Dashboard.jsx      ← expense table + Export button + Add form
    AddExpenseForm.jsx ← controlled form to add a new expense
  utils/
    csvExport.js       ← builds CSV string and triggers download
```

## Data Model

Each expense is a plain object stored in a JSON array under the `localStorage` key `"expenses"`:

```js
{
  id: string,          // crypto.randomUUID()
  date: string,        // YYYY-MM-DD
  category: string,    // e.g. "Food", "Transport"
  amount: number,      // e.g. 12.50
  description: string  // free text
}
```

## CSV Export (Approach A — Blob + anchor download)

`csvExport.js` exports a single function `downloadExpensesCSV(expenses)`:

1. Build header row: `Date,Category,Amount,Description`
2. Map each expense to a CSV row, quoting fields that may contain commas
3. Wrap the full string in a `Blob` with `type: "text/csv;charset=utf-8;"`
4. Create an object URL, attach it to a hidden `<a download="expenses-YYYY-MM-DD.csv">`, click it programmatically
5. Revoke the object URL

No external dependencies.

## UI

Dashboard contains:
- Page heading
- "Export Data" button (top right area)
- Expense table with columns: Date, Category, Amount, Description
- "Add Expense" form below the table (date, category, amount, description + submit)

No modals, charts, filters, or pagination in v1.

## Out of Scope (v1)

- Editing or deleting expenses
- Filtering/sorting
- Multiple export formats
- Backend/database
