import { jsPDF } from 'jspdf'

// ── CSV ──────────────────────────────────────────────────────────────────────

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
    [date, category, amount.toFixed(2), description].map(escapeField).join(',')
  )
  return [header, ...rows].join('\n')
}

// ── JSON ─────────────────────────────────────────────────────────────────────

export function buildJsonString(expenses) {
  const payload = {
    exportedAt: new Date().toISOString(),
    totalRecords: expenses.length,
    totalAmount: expenses.reduce((s, e) => s + e.amount, 0),
    expenses,
  }
  return JSON.stringify(payload, null, 2)
}

// ── PDF ──────────────────────────────────────────────────────────────────────

export function buildPdf(expenses, filename) {
  const doc = new jsPDF({ orientation: 'landscape' })
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0)

  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Expense Report', 14, 18)

  // Metadata line
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  const exportedAt = new Date().toLocaleString()
  doc.text(`Exported: ${exportedAt}   |   Records: ${expenses.length}   |   Total: $${totalAmount.toFixed(2)}`, 14, 26)
  doc.setTextColor(0)

  // Table header
  const colX = [14, 60, 110, 155, 200]
  const headers = ['Date', 'Category', 'Amount', 'Description']
  const rowHeight = 8
  let y = 36

  doc.setFillColor(30, 30, 60)
  doc.rect(14, y - 6, 265, rowHeight, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255)
  headers.forEach((h, i) => doc.text(h, colX[i], y - 0.5))
  doc.setTextColor(0)
  y += rowHeight

  // Table rows
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  expenses.forEach((e, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(245, 245, 252)
      doc.rect(14, y - 6, 265, rowHeight, 'F')
    }
    doc.text(e.date, colX[0], y - 0.5)
    doc.text(e.category, colX[1], y - 0.5)
    doc.text(`$${e.amount.toFixed(2)}`, colX[2], y - 0.5)
    doc.text(e.description.slice(0, 45), colX[3], y - 0.5)
    y += rowHeight
    // new page if needed
    if (y > 185) {
      doc.addPage()
      y = 20
    }
  })

  // Footer line
  doc.setDrawColor(200)
  doc.line(14, y + 2, 279, y + 2)
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Total: $${totalAmount.toFixed(2)}`, colX[2], y + 8)

  doc.save(`${filename}.pdf`)
}

// ── Shared download trigger ───────────────────────────────────────────────────

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
