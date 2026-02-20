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
