import { useState, useEffect, useCallback } from 'react'
import {
  Activity, Database, Plus, PlayCircle, Trash2,
  RefreshCw, ShieldCheck, AlertTriangle, XCircle, ChevronRight
} from 'lucide-react'
import { api } from './api'
import './index.css'

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  return Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function VerdictBadge({ verdict }) {
  const Icon = verdict === 'SAFE' ? ShieldCheck : verdict === 'PARTIAL' ? AlertTriangle : XCircle
  return (
    <span className={`verdict ${verdict}`}>
      <Icon size={14} />
      {verdict}
    </span>
  )
}

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

// ── pages ─────────────────────────────────────────────────────────────────────

function Dashboard({ balance, loading, onRefresh }) {
  if (loading) return <div className="empty"><span className="spinner" /></div>
  if (!balance) return <div className="empty">Could not load balance. Is the backend running?</div>

  const b = balance.blockers
  const blockers = [
    { label: 'Unsettled funds', value: b.unsettled_funds },
    { label: 'Refunds in flight', value: b.refunds_in_flight },
    { label: 'Reserve hold', value: b.reserve_hold },
    { label: 'Unresolved exceptions', value: b.unresolved_exceptions },
    { label: 'Pending fees', value: b.fees },
    { label: 'Already paid out', value: b.already_paid_out },
  ]

  return (
    <>
      <div className="section-header">
        <h2 className="page-title">Balance Overview</h2>
        <button className="btn btn-ghost" onClick={onRefresh}><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="grid-3">
        <div className="card">
          <p className="card-title">Paper Balance</p>
          <p className="card-value">{fmt(balance.paper_balance)}</p>
          <p className="card-sub">Gross settled inflows minus outflows</p>
        </div>
        <div className="card">
          <p className="card-title">Blocked Amount</p>
          <p className="card-value" style={{ color: 'var(--partial)' }}>{fmt(balance.blocked_amount)}</p>
          <p className="card-sub">Cannot be safely moved</p>
        </div>
        <div className="card">
          <p className="card-title">Payoutable Balance</p>
          <p className="card-value" style={{ color: 'var(--safe)' }}>{fmt(balance.payoutable_balance)}</p>
          <p className="card-sub">Safe to disburse now</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <p className="card-title">Verdict</p>
          <div style={{ marginTop: 8 }}>
            <VerdictBadge verdict={balance.verdict} />
          </div>
          {balance.explanation.length > 0 && (
            <ul className="explanation">
              {balance.explanation.map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          )}
        </div>

        <div className="card">
          <p className="card-title">Blockers Breakdown</p>
          {blockers.map(({ label, value }) => (
            <div className="blocker-row" key={label}>
              <span className="blocker-label">{label}</span>
              <span className={`blocker-value${Number(value) === 0 ? ' zero' : ''}`}>{fmt(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function LedgerPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ source: '', transaction_type: '', status: '', limit: '50' })
  const [resetting, setResetting] = useState(false)
  const [msg, setMsg] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await api.ledger(filters)
      setEntries(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load() }, [load])

  async function handleReset() {
    if (!confirm('Delete all ledger entries? This cannot be undone.')) return
    setResetting(true)
    try {
      await api.resetLedger()
      setMsg({ type: 'success', text: 'Ledger reset successfully.' })
      load()
    } catch (e) { setMsg({ type: 'error', text: e.message }) }
    finally { setResetting(false) }
  }

  return (
    <>
      <div className="section-header">
        <h2 className="page-title">Ledger Entries</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={load}><RefreshCw size={14} /> Refresh</button>
          <button className="btn btn-danger" onClick={handleReset} disabled={resetting}>
            <Trash2 size={14} /> Reset
          </button>
        </div>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="filters">
        {['source', 'transaction_type', 'status'].map(key => (
          <select key={key} value={filters[key]}
            onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}>
            <option value="">{key.replace('_', ' ')}</option>
            {key === 'source' && ['stripe','adyen','bank','erp','payout_processor','manual'].map(v =>
              <option key={v} value={v}>{v}</option>)}
            {key === 'transaction_type' && ['charge','settlement','payout','refund','fee','reserve','exception'].map(v =>
              <option key={v} value={v}>{v}</option>)}
            {key === 'status' && ['pending','settled','failed','reversed','open','resolved'].map(v =>
              <option key={v} value={v}>{v}</option>)}
          </select>
        ))}
        <select value={filters.limit}
          onChange={e => setFilters(f => ({ ...f, limit: e.target.value }))}>
          {[20,50,100,200].map(n => <option key={n} value={n}>{n} rows</option>)}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          {loading ? <div className="empty"><span className="spinner" /></div> : entries.length === 0
            ? <div className="empty">No entries found.</div>
            : (
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Event Time</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(e => (
                    <tr key={e.id}>
                      <td><span className="badge badge-settled">{e.source}</span></td>
                      <td style={{ textTransform: 'capitalize' }}>{e.transaction_type}</td>
                      <td style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--text-h)' }}>{fmt(e.amount)}</td>
                      <td><StatusBadge status={e.status} /></td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.description || '—'}
                      </td>
                      <td className="mono">{new Date(e.event_timestamp).toLocaleDateString()}</td>
                      <td className="mono" style={{ color: 'var(--text-muted)' }}>{e.id.slice(0, 8)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </>
  )
}

const BLANK_ENTRY = {
  source: 'manual', external_id: '', transaction_type: 'charge', amount: '',
  currency: 'USD', status: 'settled', event_timestamp: '', settlement_id: '',
  payout_id: '', exception_type: '', description: '',
}

function IngestPage({ onSuccess }) {
  const [form, setForm] = useState(BLANK_ENTRY)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setMsg(null)
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        event_timestamp: new Date(form.event_timestamp).toISOString(),
        external_id: form.external_id || null,
        settlement_id: form.settlement_id || null,
        payout_id: form.payout_id || null,
        exception_type: form.exception_type || null,
        description: form.description || null,
      }
      await api.ingest(payload)
      setMsg({ type: 'success', text: 'Entry ingested successfully.' })
      setForm({ ...BLANK_ENTRY })
      onSuccess()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    finally { setLoading(false) }
  }

  return (
    <>
      <h2 className="page-title">Ingest Event</h2>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="card">
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Source *</label>
              <select value={form.source} onChange={e => set('source', e.target.value)}>
                {['stripe','adyen','bank','erp','payout_processor','manual'].map(v =>
                  <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>External ID</label>
              <input placeholder="ch_abc123" value={form.external_id} onChange={e => set('external_id', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Transaction Type *</label>
              <select value={form.transaction_type} onChange={e => set('transaction_type', e.target.value)}>
                {['charge','settlement','payout','refund','fee','reserve','exception'].map(v =>
                  <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Amount (USD) *</label>
              <input type="number" step="0.01" min="0.01" required placeholder="1000.00"
                value={form.amount} onChange={e => set('amount', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Status *</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {['pending','settled','failed','reversed','open','resolved'].map(v =>
                  <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Event Timestamp *</label>
              <input type="datetime-local" required value={form.event_timestamp}
                onChange={e => set('event_timestamp', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Settlement ID</label>
              <input placeholder="STL-001" value={form.settlement_id} onChange={e => set('settlement_id', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Payout ID</label>
              <input placeholder="PO-001" value={form.payout_id} onChange={e => set('payout_id', e.target.value)} />
            </div>
            {form.transaction_type === 'exception' && (
              <div className="form-group">
                <label>Exception Type</label>
                <select value={form.exception_type} onChange={e => set('exception_type', e.target.value)}>
                  <option value="">—</option>
                  {['settlement_delay','fee_mismatch','duplicate_payout','missing_bank_credit','refund_discrepancy','reserve_hold','unknown'].map(v =>
                    <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            )}
            <div className="form-group full">
              <label>Description</label>
              <input placeholder="e.g. Stripe charge from merchant ABC" value={form.description}
                onChange={e => set('description', e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Plus size={14} />}
              Ingest Entry
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

function SimulatePage({ balance }) {
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      const data = await api.simulate(parseFloat(amount))
      setResult(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <>
      <h2 className="page-title">Simulate Payout</h2>

      {balance && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="card-title">Current Payoutable Balance</p>
          <p className="card-value" style={{ color: 'var(--safe)' }}>{fmt(balance.payoutable_balance)}</p>
          <div style={{ marginTop: 8 }}><VerdictBadge verdict={balance.verdict} /></div>
        </div>
      )}

      <div className="card">
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Planned Payout Amount (USD) *</label>
            <input type="number" step="0.01" min="0.01" required
              placeholder="500000.00" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div style={{ marginTop: 14 }}>
            <button type="submit" className="btn btn-primary" disabled={loading || !amount}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <PlayCircle size={14} />}
              Run Simulation
            </button>
          </div>
        </form>

        {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}

        {result && (
          <div className={`sim-result ${result.verdict}`}>
            <VerdictBadge verdict={result.verdict} />
            <p>{result.message}</p>
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: 'Planned', value: result.planned_payout_amount },
                { label: 'Available', value: result.payoutable_balance },
                { label: 'Shortfall', value: result.shortfall },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-h)' }}>{fmt(value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ── root ──────────────────────────────────────────────────────────────────────

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', Icon: Activity },
  { id: 'ledger', label: 'Ledger', Icon: Database },
  { id: 'ingest', label: 'Ingest Event', Icon: Plus },
  { id: 'simulate', label: 'Simulate Payout', Icon: PlayCircle },
]

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [online, setOnline] = useState(null)
  const [balance, setBalance] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(false)

  const loadBalance = useCallback(async () => {
    setBalanceLoading(true)
    try {
      const data = await api.balance()
      setBalance(data)
      setOnline(true)
    } catch {
      setOnline(false)
    } finally {
      setBalanceLoading(false)
    }
  }, [])

  useEffect(() => {
    api.health().then(() => setOnline(true)).catch(() => setOnline(false))
    loadBalance()
  }, [loadBalance])

  return (
    <div className="app">
      <div className="topbar">
        <div>
          <div className="topbar-title">Atlas Ledger</div>
          <div className="topbar-subtitle">Real-time reconciliation engine</div>
        </div>
        <span className={`status-dot ${online === true ? 'online' : online === false ? 'offline' : ''}`} />
        <span className="status-label" style={{ color: online ? 'var(--safe)' : online === false ? 'var(--blocked)' : 'var(--text-muted)' }}>
          {online === true ? 'Backend online' : online === false ? 'Backend offline' : 'Connecting…'}
        </span>
      </div>

      <div className="main">
        <nav className="sidebar">
          {PAGES.map(({ id, label, Icon }) => (
            <button key={id} className={`nav-item${page === id ? ' active' : ''}`} onClick={() => setPage(id)}>
              <Icon size={16} />
              {label}
              {page === id && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </nav>

        <main className="content">
          {page === 'dashboard' && <Dashboard balance={balance} loading={balanceLoading} onRefresh={loadBalance} />}
          {page === 'ledger' && <LedgerPage />}
          {page === 'ingest' && <IngestPage onSuccess={loadBalance} />}
          {page === 'simulate' && <SimulatePage balance={balance} />}
        </main>
      </div>
    </div>
  )
}
