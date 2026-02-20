function escapeField(value) {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
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
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
