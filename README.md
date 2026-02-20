# Expense Tracker AI

A lightweight personal expense tracker built with React and Vite. Log expenses, view them in a dashboard, and export your data as CSV.

## Features

- Add expenses with description, amount, category, and date
- View all expenses in a sortable dashboard table
- Persist data in localStorage (no backend required)
- Export expenses to CSV

## Tech Stack

- React 19
- Vite 7
- Vitest (unit tests)
- localStorage for data persistence

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |

## Project Structure

```
src/
  components/
    AddExpenseForm.jsx   # Form to add a new expense
    Dashboard.jsx        # Expense table and CSV export
  utils/
    csvExport.js         # CSV generation and download
    expenseStorage.js    # localStorage read/write helpers
  App.jsx                # Root component with state management
  main.jsx               # Entry point
```
