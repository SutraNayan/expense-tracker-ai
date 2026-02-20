import { useState } from 'react'
import AddExpenseForm from './AddExpenseForm'
import ExportModal from './ExportModal'

export default function Dashboard({ expenses, onAdd }) {
  const [showExport, setShowExport] = useState(false)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Expense Tracker</h1>
        <button
          onClick={() => setShowExport(true)}
          style={{
            padding: '9px 18px', fontSize: '14px', fontWeight: '600',
            background: '#2563eb', color: '#fff', border: 'none',
            borderRadius: '8px', cursor: 'pointer',
          }}
        >
          ↓ Export Data
        </button>
      </div>

      {showExport && (
        <ExportModal expenses={expenses} onClose={() => setShowExport(false)} />
      )}

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
