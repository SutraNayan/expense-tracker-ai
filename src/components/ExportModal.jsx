import { useState, useMemo } from 'react'
import { buildCsvString, buildJsonString, buildPdf, downloadBlob } from '../utils/exportV2'

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Other']
const FORMATS = ['CSV', 'JSON', 'PDF']

const COLORS = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  danger: '#dc2626',
  surface: '#ffffff',
  surfaceAlt: '#f8fafc',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  text: '#0f172a',
  muted: '#64748b',
  headerBg: '#1e1e3c',
  headerText: '#ffffff',
  rowAlt: '#f5f5fc',
  tagBg: '#eff6ff',
  tagText: '#1d4ed8',
  successBg: '#f0fdf4',
  successText: '#15803d',
}

// ── Tiny shared primitives ────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em',
      textTransform: 'uppercase', color: COLORS.muted, marginBottom: '10px' }}>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: COLORS.border, margin: '20px 0' }} />
}

// ── Format tab pill ───────────────────────────────────────────────────────────

function FormatTab({ label, active, onClick }) {
  const ext = label.toLowerCase()
  const descriptions = { csv: 'Spreadsheet-compatible', json: 'Machine-readable', pdf: 'Print-ready report' }
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '10px 8px', border: `2px solid ${active ? COLORS.primary : COLORS.border}`,
        borderRadius: '8px', background: active ? COLORS.tagBg : COLORS.surface,
        color: active ? COLORS.primary : COLORS.text, cursor: 'pointer',
        fontWeight: active ? '700' : '500', fontSize: '13px',
        transition: 'all 0.15s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
      }}
    >
      <span style={{ fontSize: '16px' }}>
        {ext === 'csv' ? '📊' : ext === 'json' ? '{ }' : '📄'}
      </span>
      <span>{label}</span>
      <span style={{ fontSize: '10px', color: COLORS.muted, fontWeight: '400' }}>
        {descriptions[ext]}
      </span>
    </button>
  )
}

// ── Category checkbox chip ────────────────────────────────────────────────────

function CategoryChip({ label, checked, onChange }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '5px 10px', border: `1.5px solid ${checked ? COLORS.primary : COLORS.border}`,
      borderRadius: '20px', cursor: 'pointer', fontSize: '13px',
      background: checked ? COLORS.tagBg : COLORS.surface,
      color: checked ? COLORS.primary : COLORS.text,
      fontWeight: checked ? '600' : '400',
      transition: 'all 0.12s ease', userSelect: 'none',
    }}>
      <input type="checkbox" checked={checked} onChange={onChange}
        style={{ display: 'none' }} />
      {checked ? '✓ ' : ''}{label}
    </label>
  )
}

// ── Preview table ─────────────────────────────────────────────────────────────

function PreviewTable({ rows }) {
  if (rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px', color: COLORS.muted,
        background: COLORS.surfaceAlt, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
        No records match the current filters.
      </div>
    )
  }
  return (
    <div style={{ overflowY: 'auto', maxHeight: '200px', borderRadius: '8px',
      border: `1px solid ${COLORS.border}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr>
            {['Date', 'Category', 'Amount', 'Description'].map(h => (
              <th key={h} style={{
                textAlign: 'left', padding: '8px 12px',
                background: COLORS.headerBg, color: COLORS.headerText,
                fontWeight: '600', position: 'sticky', top: 0, fontSize: '12px',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((e, i) => (
            <tr key={e.id} style={{ background: i % 2 === 0 ? COLORS.surface : COLORS.rowAlt }}>
              <td style={{ padding: '7px 12px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.muted }}>{e.date}</td>
              <td style={{ padding: '7px 12px', borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ background: COLORS.tagBg, color: COLORS.tagText,
                  padding: '2px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>
                  {e.category}
                </span>
              </td>
              <td style={{ padding: '7px 12px', borderBottom: `1px solid ${COLORS.border}`,
                fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
                ${e.amount.toFixed(2)}
              </td>
              <td style={{ padding: '7px 12px', borderBottom: `1px solid ${COLORS.border}`,
                color: COLORS.muted, maxWidth: '180px', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.description || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Summary badge ─────────────────────────────────────────────────────────────

function ExportSummary({ count, total, format }) {
  const formatLabel = { csv: 'CSV', json: 'JSON', pdf: 'PDF' }[format]
  if (count === 0) {
    return (
      <div style={{ padding: '12px 16px', background: '#fff7ed',
        border: '1px solid #fed7aa', borderRadius: '8px',
        color: '#c2410c', fontSize: '13px', fontWeight: '500' }}>
        ⚠ No records match your filters — adjust dates or categories.
      </div>
    )
  }
  return (
    <div style={{ padding: '12px 16px', background: COLORS.successBg,
      border: `1px solid #bbf7d0`, borderRadius: '8px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: COLORS.successText, fontWeight: '600', fontSize: '13px' }}>
        ✓ {count} record{count !== 1 ? 's' : ''} ready to export as {formatLabel}
      </span>
      <span style={{ color: COLORS.successText, fontSize: '14px', fontWeight: '700',
        fontVariantNumeric: 'tabular-nums' }}>
        ${total.toFixed(2)} total
      </span>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function ExportModal({ expenses, onClose }) {
  const today = new Date().toISOString().slice(0, 10)

  const [format, setFormat] = useState('csv')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState(today)
  const [selectedCats, setSelectedCats] = useState(new Set(CATEGORIES))
  const [filename, setFilename] = useState(`expenses-${today}`)
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  // Derived: filtered rows
  const filtered = useMemo(() => {
    return expenses.filter(e => {
      if (startDate && e.date < startDate) return false
      if (endDate && e.date > endDate) return false
      if (!selectedCats.has(e.category)) return false
      return true
    })
  }, [expenses, startDate, endDate, selectedCats])

  const totalAmount = useMemo(
    () => filtered.reduce((sum, e) => sum + e.amount, 0),
    [filtered]
  )

  function toggleCat(cat) {
    setSelectedCats(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  function toggleAllCats() {
    setSelectedCats(prev =>
      prev.size === CATEGORIES.length ? new Set() : new Set(CATEGORIES)
    )
  }

  async function handleExport() {
    if (filtered.length === 0) return
    setLoading(true)
    // Small delay so the loading state is visible (feels intentional, not accidental)
    await new Promise(r => setTimeout(r, 600))
    try {
      if (format === 'csv') {
        const csv = buildCsvString(filtered)
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        downloadBlob(blob, `${filename}.csv`)
      } else if (format === 'json') {
        const json = buildJsonString(filtered)
        const blob = new Blob([json], { type: 'application/json' })
        downloadBlob(blob, `${filename}.json`)
      } else if (format === 'pdf') {
        buildPdf(filtered, filename)
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  // Close on backdrop click
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  const allSelected = selectedCats.size === CATEGORIES.length
  const someSelected = selectedCats.size > 0 && !allSelected

  return (
    // Backdrop
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '16px',
        backdropFilter: 'blur(2px)',
      }}
    >
      {/* Modal panel */}
      <div style={{
        background: COLORS.surface, borderRadius: '16px',
        width: '100%', maxWidth: '680px', maxHeight: '92vh',
        overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px 16px', borderBottom: `1px solid ${COLORS.border}`,
          position: 'sticky', top: 0, background: COLORS.surface, zIndex: 1,
          borderRadius: '16px 16px 0 0',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: COLORS.text }}>
              Export Data
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: COLORS.muted }}>
              Configure your export options below
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '22px', color: COLORS.muted, lineHeight: 1,
              padding: '4px 8px', borderRadius: '8px',
            }}
            aria-label="Close export dialog"
          >
            ×
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* Format selector */}
          <SectionTitle>Export Format</SectionTitle>
          <div style={{ display: 'flex', gap: '10px' }}>
            {FORMATS.map(f => (
              <FormatTab
                key={f}
                label={f}
                active={format === f.toLowerCase()}
                onClick={() => setFormat(f.toLowerCase())}
              />
            ))}
          </div>

          <Divider />

          {/* Date range */}
          <SectionTitle>Date Range</SectionTitle>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '140px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: COLORS.muted }}>From</span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                max={endDate || today}
                style={{
                  padding: '8px 10px', borderRadius: '8px',
                  border: `1.5px solid ${COLORS.border}`, fontSize: '14px',
                  color: COLORS.text, background: COLORS.surface,
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '140px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: COLORS.muted }}>To</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate || undefined}
                max={today}
                style={{
                  padding: '8px 10px', borderRadius: '8px',
                  border: `1.5px solid ${COLORS.border}`, fontSize: '14px',
                  color: COLORS.text, background: COLORS.surface,
                }}
              />
            </label>
            {startDate && (
              <button
                onClick={() => setStartDate('')}
                style={{
                  alignSelf: 'flex-end', padding: '8px 12px', fontSize: '12px',
                  border: `1px solid ${COLORS.border}`, borderRadius: '8px',
                  background: COLORS.surface, color: COLORS.muted, cursor: 'pointer',
                }}
              >
                Clear
              </button>
            )}
          </div>

          <Divider />

          {/* Category filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <SectionTitle>Categories</SectionTitle>
            <button
              onClick={toggleAllCats}
              style={{
                fontSize: '12px', padding: '3px 10px',
                border: `1px solid ${COLORS.border}`, borderRadius: '6px',
                background: COLORS.surface, cursor: 'pointer', color: COLORS.muted,
                marginBottom: '10px',
              }}
            >
              {allSelected ? 'Deselect all' : someSelected ? 'Select all' : 'Select all'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CATEGORIES.map(cat => (
              <CategoryChip
                key={cat}
                label={cat}
                checked={selectedCats.has(cat)}
                onChange={() => toggleCat(cat)}
              />
            ))}
          </div>

          <Divider />

          {/* Custom filename */}
          <SectionTitle>Filename</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            <input
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value.replace(/[^a-zA-Z0-9_\-]/g, '-'))}
              style={{
                flex: 1, padding: '9px 12px', fontSize: '14px',
                border: `1.5px solid ${COLORS.border}`,
                borderRight: 'none',
                borderRadius: '8px 0 0 8px',
                color: COLORS.text, background: COLORS.surface,
                fontFamily: 'monospace',
              }}
            />
            <span style={{
              padding: '9px 12px', fontSize: '14px', fontFamily: 'monospace',
              background: COLORS.surfaceAlt, border: `1.5px solid ${COLORS.border}`,
              borderLeft: 'none', borderRadius: '0 8px 8px 0',
              color: COLORS.muted, whiteSpace: 'nowrap',
            }}>
              .{format}
            </span>
          </div>

          <Divider />

          {/* Export summary */}
          <ExportSummary count={filtered.length} total={totalAmount} format={format} />

          <Divider />

          {/* Preview section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <SectionTitle>Data Preview</SectionTitle>
            <button
              onClick={() => setShowPreview(p => !p)}
              style={{
                fontSize: '12px', padding: '3px 10px', marginBottom: '10px',
                border: `1px solid ${COLORS.border}`, borderRadius: '6px',
                background: COLORS.surface, cursor: 'pointer', color: COLORS.muted,
              }}
            >
              {showPreview ? 'Hide' : 'Show'}
            </button>
          </div>
          {showPreview && <PreviewTable rows={filtered} />}
        </div>

        {/* ── Footer / Actions ── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '10px',
          padding: '16px 24px', borderTop: `1px solid ${COLORS.border}`,
          position: 'sticky', bottom: 0, background: COLORS.surface,
          borderRadius: '0 0 16px 16px',
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 20px', fontSize: '14px', fontWeight: '600',
              border: `1.5px solid ${COLORS.border}`, borderRadius: '8px',
              background: COLORS.surface, color: COLORS.text,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading || filtered.length === 0}
            style={{
              padding: '10px 24px', fontSize: '14px', fontWeight: '700',
              border: 'none', borderRadius: '8px',
              background: filtered.length === 0 ? COLORS.borderStrong : COLORS.primary,
              color: COLORS.surface,
              cursor: loading || filtered.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              minWidth: '130px', justifyContent: 'center',
              transition: 'background 0.15s ease',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  display: 'inline-block', width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Exporting…
              </>
            ) : (
              <>
                ↓ Export {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keyframe for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
