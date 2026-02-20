import { describe, it, expect } from 'vitest'
import { buildCsvString } from './csvExport'

describe('buildCsvString', () => {
  it('returns header row when expenses is empty', () => {
    const result = buildCsvString([])
    expect(result).toBe('Date,Category,Amount,Description')
  })

  it('returns one data row for a single expense', () => {
    const expenses = [
      { date: '2026-02-20', category: 'Food', amount: 12.5, description: 'Lunch' }
    ]
    const result = buildCsvString(expenses)
    expect(result).toBe('Date,Category,Amount,Description\n2026-02-20,Food,12.5,Lunch')
  })

  it('wraps fields containing commas in double quotes', () => {
    const expenses = [
      { date: '2026-02-20', category: 'Food', amount: 5, description: 'Coffee, large' }
    ]
    const result = buildCsvString(expenses)
    expect(result).toContain('"Coffee, large"')
  })

  it('wraps fields containing double quotes and escapes them', () => {
    const expenses = [
      { date: '2026-02-20', category: 'Other', amount: 10, description: 'Say "hello"' }
    ]
    const result = buildCsvString(expenses)
    expect(result).toContain('"Say ""hello"""')
  })
})
