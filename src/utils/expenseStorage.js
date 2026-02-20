const KEY = 'expenses'

export function loadExpenses() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveExpenses(expenses) {
  try {
    localStorage.setItem(KEY, JSON.stringify(expenses))
  } catch {
    console.warn('Could not save expenses to localStorage.')
  }
}
