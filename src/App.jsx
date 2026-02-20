import { useState } from 'react'
import Dashboard from './components/Dashboard'
import { loadExpenses, saveExpenses } from './utils/expenseStorage'

const SAMPLE_EXPENSES = [
  { id: '1', date: '2026-01-05', category: 'Food',          amount: 42.50,  description: 'Grocery run – Whole Foods' },
  { id: '2', date: '2026-01-08', category: 'Transport',     amount: 28.00,  description: 'Uber to airport' },
  { id: '3', date: '2026-01-12', category: 'Housing',       amount: 1450.00, description: 'January rent' },
  { id: '4', date: '2026-01-15', category: 'Entertainment', amount: 15.99,  description: 'Netflix subscription' },
  { id: '5', date: '2026-01-18', category: 'Health',        amount: 85.00,  description: 'Gym membership' },
  { id: '6', date: '2026-01-22', category: 'Food',          amount: 63.75,  description: 'Dinner with colleagues' },
  { id: '7', date: '2026-01-25', category: 'Transport',     amount: 4.50,   description: 'Bus pass top-up' },
  { id: '8', date: '2026-02-02', category: 'Food',          amount: 11.20,  description: 'Coffee & pastry' },
  { id: '9', date: '2026-02-05', category: 'Other',         amount: 34.99,  description: 'Phone case replacement' },
  { id: '10', date: '2026-02-10', category: 'Health',       amount: 22.00,  description: 'Prescription top-up' },
  { id: '11', date: '2026-02-14', category: 'Entertainment',amount: 48.00,  description: 'Valentine dinner (drinks)' },
  { id: '12', date: '2026-02-18', category: 'Transport',    amount: 55.00,  description: 'Monthly train pass' },
]

function loadOrSeed() {
  const stored = loadExpenses()
  if (stored.length > 0) return stored
  saveExpenses(SAMPLE_EXPENSES)
  return SAMPLE_EXPENSES
}

export default function App() {
  const [expenses, setExpenses] = useState(loadOrSeed)

  function handleAdd(expense) {
    const updated = [...expenses, expense]
    setExpenses(updated)
    saveExpenses(updated)
  }

  return <Dashboard expenses={expenses} onAdd={handleAdd} />
}
