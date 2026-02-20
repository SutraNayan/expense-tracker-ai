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
