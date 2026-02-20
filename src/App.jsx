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
