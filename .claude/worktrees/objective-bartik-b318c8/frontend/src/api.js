const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || res.statusText)
  }
  return res.json()
}

export const api = {
  health: () => request('/health'),
  balance: () => request('/balance/payoutable'),
  ledger: (params = {}) => {
    const q = new URLSearchParams(Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ))
    return request(`/ledger?${q}`)
  },
  resetLedger: () => request('/ledger/reset', { method: 'DELETE' }),
  ingest: (entry) => request('/ingest/manual', { method: 'POST', body: JSON.stringify(entry) }),
  simulate: (amount) => request('/simulate/payout', {
    method: 'POST',
    body: JSON.stringify({ planned_payout_amount: amount }),
  }),
}
