'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AtlasNav from '@/components/atlas/AtlasNav'
import AtlasFooter from '@/components/atlas/AtlasFooter'
import PageCurtain from '@/components/atlas/PageCurtain'

// ── Tiny icons (inline SVG) ──────────────────────────────────────────
function CheckIcon() {
  return <svg viewBox="0 0 16 16" width={18} height={18} fill="none"><path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function ArrowIcon({ size = 13 }: { size?: number }) {
  return <svg viewBox="0 0 16 16" width={size} height={size} fill="none"><path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

const ICON_PATHS: Record<string, string> = {
  server: '<rect x="2" y="3" width="12" height="4" rx="1"/><rect x="2" y="9" width="12" height="4" rx="1"/>',
  key:    '<circle cx="5" cy="11" r="2.5"/><path d="M7 9l6-6m-2 2 2 2m-4 0 2 2"/>',
  shield: '<path d="M8 1.5 2.5 4v4.5c0 3 2.4 5.4 5.5 6 3.1-.6 5.5-3 5.5-6V4L8 1.5z"/>',
  lock:   '<rect x="3" y="7" width="10" height="7" rx="1.2"/><path d="M5 7V5a3 3 0 016 0v2"/>',
  eye:    '<path d="M1.5 8s2.5-5 6.5-5 6.5 5 6.5 5-2.5 5-6.5 5-6.5-5-6.5-5z"/><circle cx="8" cy="8" r="2"/>',
}
function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] ?? '' }} />
  )
}

// ── SVG arch flow ────────────────────────────────────────────────────
function Block({ x, y, w, h, label, sub, highlight }: { x: number; y: number; w: number; h: number; label: string; sub: string; highlight?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6"
        fill={highlight ? 'var(--canvas-soft)' : 'var(--canvas)'}
        stroke={highlight ? 'rgba(255,255,255,0.2)' : 'var(--hairline)'} strokeWidth="1" />
      <text x={x + w / 2} y={y + h / 2 - 4} fill="var(--ink)" fontSize="11" fontFamily="var(--font-mono)" letterSpacing="1.2" textAnchor="middle">{label}</text>
      <text x={x + w / 2} y={y + h / 2 + 12} fill="var(--body-mid)" fontSize="10" fontFamily="var(--font-mono)" letterSpacing="0.8" textAnchor="middle">{sub}</text>
    </g>
  )
}
function Line({ x1, y1, x2, y2, dash }: { x1: number; y1: number; x2: number; y2: number; dash?: boolean }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="var(--body-mid)" strokeOpacity="0.45"
      strokeDasharray={dash ? '3 3' : undefined}
      strokeWidth="1" markerEnd="url(#arr-s)" />
  )
}
function ArchFlow() {
  return (
    <div style={{ marginTop: 14, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 520 360" width="100%" style={{ display: 'block', maxHeight: 380 }}>
        <defs>
          <marker id="arr-s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--body-mid)" />
          </marker>
        </defs>
        <Block x={20}  y={20}  w={120} h={50} label="STRIPE"   sub="balance.read" />
        <Block x={20}  y={90}  w={120} h={50} label="PLAID"    sub="accounts.read" />
        <Block x={20}  y={160} w={120} h={50} label="NETSUITE" sub="journal.read" />
        <Block x={200} y={90}  w={140} h={90} label="ATLAS EDGE" sub="mTLS · JWT" highlight />
        <Block x={380} y={20}  w={120} h={50} label="DRIFT VM"  sub="firecracker" />
        <Block x={380} y={90}  w={120} h={50} label="STATE VM"  sub="canonical" />
        <Block x={380} y={160} w={120} h={50} label="LEDGER"    sub="AES-256-GCM" />
        <Block x={200} y={250} w={300} h={50} label="APPEND-ONLY AUDIT LOG" sub="merkle-chained" highlight />
        <Line x1={140} y1={45}  x2={200} y2={120} />
        <Line x1={140} y1={115} x2={200} y2={135} />
        <Line x1={140} y1={185} x2={200} y2={150} />
        <Line x1={340} y1={120} x2={380} y2={45} />
        <Line x1={340} y1={135} x2={380} y2={115} />
        <Line x1={340} y1={150} x2={380} y2={185} />
        <Line x1={270} y1={180} x2={270} y2={250} dash />
        <Line x1={440} y1={210} x2={440} y2={250} dash />
      </svg>
    </div>
  )
}

// ── Architecture layers ──────────────────────────────────────────────
const LAYERS = [
  { id: 'edge',    eye: 'EDGE',    icon: 'server', t: 'Mutual TLS + key pinning',      d: 'All API traffic uses mutual-TLS with per-tenant client certificates. JWT signing keys rotate every 24 hours.',
    tags: ['MTLS-1.3', 'JWT · 24h ROT', 'HSTS · PRELOAD'] },
  { id: 'auth',    eye: 'AUTH',    icon: 'key',    t: 'Scoped tokens',                 d: 'Atlas only ever holds read scopes (Stripe balance.read, Plaid accounts.read, ERP journal.read). No write permissions exist anywhere in the codebase.',
    tags: ['OAUTH2', 'READ-ONLY', 'SCOPED TOKENS'] },
  { id: 'compute', eye: 'COMPUTE', icon: 'shield', t: 'Isolated tenant runtime',       d: 'Each tenant\'s drift engine runs in a sealed Firecracker microVM. Cross-tenant memory access is architecturally impossible.',
    tags: ['FIRECRACKER', 'PER-TENANT VM', 'NO SHARED MEM'] },
  { id: 'storage', eye: 'STORAGE', icon: 'lock',   t: 'Envelope-encrypted ledger',     d: 'Ledger rows are envelope-encrypted with per-tenant KEKs in AWS KMS. Data-at-rest is AES-256-GCM. No engineer can decrypt a row without an audit-logged break-glass.',
    tags: ['AES-256-GCM', 'KMS · PER-TENANT', 'ENVELOPE ENC'] },
  { id: 'audit',   eye: 'AUDIT',   icon: 'eye',    t: 'Append-only event log',         d: 'Every Atlas action — every decision, every override, every key access — is written to an append-only, cryptographically-chained log. Tamper-evident, exportable, and continuously compared to S3-Object-Lock snapshots.',
    tags: ['APPEND-ONLY', 'MERKLE-CHAINED', 'S3 OBJECT LOCK'] },
]

// ── Audit trail seed ─────────────────────────────────────────────────
const AUDIT_SEED = [
  { id: 'ACT_0421', t: '0.4s', actor: 'atlas.drift-engine',   v: 'FREEZE_PAYOUT',     tone: 'drift', evid: 'EVT_0181' },
  { id: 'ACT_0420', t: '1.1s', actor: 'atlas.state-builder',  v: 'RECONCILE_BATCH',   tone: 'ok',    evid: 'BCH_4421' },
  { id: 'ACT_0419', t: '1.8s', actor: 'n.rodriguez@northwind',v: 'OVERRIDE_APPROVE',  tone: 'warn',  evid: 'EVT_0177' },
  { id: 'ACT_0418', t: '2.3s', actor: 'atlas.audit-writer',   v: 'ROTATE_KEK',        tone: 'ok',    evid: 'KMS_a7f3' },
  { id: 'ACT_0417', t: '3.0s', actor: 'atlas.drift-engine',   v: 'RAISE_CONFIDENCE',  tone: 'ok',    evid: 'STA_0019' },
  { id: 'ACT_0416', t: '4.7s', actor: 'atlas.lineage-svc',    v: 'ATTACH_PROVENANCE', tone: 'ok',    evid: 'LIN_3344' },
  { id: 'ACT_0415', t: '6.1s', actor: 'atlas.drift-engine',   v: 'FLAG_DUPLICATE',    tone: 'warn',  evid: 'EVT_0179' },
  { id: 'ACT_0414', t: '7.4s', actor: 'system.kms',           v: 'DECRYPT · LOGGED',  tone: 'ok',    evid: 'DEK_88ab' },
]

interface AuditRow { id: string; t: string; actor: string; v: string; tone: string; evid: string }

export default function SecurityPage() {
  const [active, setActive] = useState<string | null>(null)
  const [rows, setRows] = useState<AuditRow[]>(AUDIT_SEED)

  useEffect(() => {
    const id = setInterval(() => {
      setRows(prev => {
        const last = prev[0]
        const nextId = 'ACT_' + (parseInt(last.id.split('_')[1]) + 1)
        const choices = ['RECONCILE_BATCH', 'RAISE_CONFIDENCE', 'ATTACH_PROVENANCE', 'FLAG_DUPLICATE', 'FREEZE_PAYOUT', 'ROTATE_KEK', 'DECRYPT · LOGGED']
        const tones   = ['ok', 'ok', 'ok', 'warn', 'drift', 'ok', 'ok']
        const i = Math.floor(Math.random() * choices.length)
        const actors = ['atlas.drift-engine', 'atlas.state-builder', 'atlas.audit-writer', 'atlas.lineage-svc']
        return [{
          id: nextId,
          t: (Math.random() * 0.8 + 0.1).toFixed(1) + 's',
          actor: actors[Math.floor(Math.random() * actors.length)],
          v: choices[i], tone: tones[i],
          evid: 'EVT_' + Math.floor(Math.random() * 9999).toString().padStart(4, '0'),
        }, ...prev.slice(0, 9)]
      })
    }, 2400)
    return () => clearInterval(id)
  }, [])

  const toneColor = (t: string) => t === 'drift' ? 'var(--status-drift)' : t === 'warn' ? 'var(--status-warn)' : 'var(--status-ok)'

  const activeLayer = LAYERS.find(l => l.id === active) ?? null

  return (
    <>
      <div className="bg-grid" />
      <PageCurtain />
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--canvas)', minHeight: '100vh' }}>
        <AtlasNav />

        {/* Hero */}
        <section style={{ padding: '96px 0 56px', position: 'relative' }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div className="rise" style={{ marginBottom: 24 }}>
              <span className="atlas-eyebrow">SECURITY POSTURE · AUDITED</span>
            </div>
            <h1 className="rise" style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(48px,7vw,84px)', fontWeight: 400,
              lineHeight: 1, letterSpacing: '-2px', maxWidth: 900, margin: 0, animationDelay: '0.05s',
            }}>
              Read-only by design.<br /><span style={{ color: 'var(--body-mid)' }}>Capital never touches Atlas.</span>
            </h1>
            <p className="rise" style={{ marginTop: 28, maxWidth: 640, color: 'var(--body)', fontSize: 18, lineHeight: '28px', animationDelay: '0.1s' }}>
              Atlas observes settlement flows through read-only credentials. No funds, no payment instruments, no write access. Every action is logged, every key is rotated, every decision is auditable.
            </p>
            <div className="rise" style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap', animationDelay: '0.15s' }}>
              <Link href="/waitlist" className="atlas-btn atlas-btn--primary">Request access</Link>
              <button className="atlas-btn">Download SOC 2 report <ArrowIcon /></button>
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section style={{ padding: '60px 0 80px', borderTop: '1px solid var(--hairline)' }}>
          <div className="container">
            <div className="section-head">
              <div>
                <span className="atlas-eyebrow">DEFENSE IN DEPTH</span>
                <h2 style={{ marginTop: 18, fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 400, lineHeight: 1, letterSpacing: '-1.2px', maxWidth: 720, margin: '18px 0 0' }}>
                  Five layers between your data<br /><span style={{ color: 'var(--body-mid)' }}>and the outside world.</span>
                </h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 32, alignItems: 'stretch' }}>
              {/* Stack */}
              <div className="atlas-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span className="atlas-eyebrow">STACK</span>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {LAYERS.map((l, i) => {
                    const on = active === l.id
                    return (
                      <div key={l.id}
                        onMouseEnter={() => setActive(l.id)}
                        onMouseLeave={() => setActive(null)}
                        style={{
                          padding: '16px',
                          border: '1px solid ' + (on ? 'rgba(255,255,255,0.25)' : 'var(--hairline)'),
                          background: on ? 'var(--canvas-soft)' : 'transparent',
                          borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          transition: 'all 0.15s ease', cursor: 'pointer',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)', width: 24 }}>0{i + 1}</span>
                          <Icon name={l.icon} />
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '-0.2px' }}>{l.t}</span>
                        </div>
                        <span className="atlas-pill" style={{ fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>{l.eye}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Detail */}
              <div className="atlas-card" style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
                <span className="atlas-eyebrow">{activeLayer ? activeLayer.eye + ' · DETAIL' : 'FLOW'}</span>
                {!activeLayer && <ArchFlow />}
                {activeLayer && (
                  <div style={{ marginTop: 14, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: '32px', letterSpacing: '-0.6px', fontWeight: 400 }}>
                      {activeLayer.t}
                    </h3>
                    <p style={{ marginTop: 18, color: 'var(--body)', fontSize: 15, lineHeight: '24px', flex: 1 }}>{activeLayer.d}</p>
                    <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {activeLayer.tags.map(b => (
                        <span key={b} className="atlas-pill" style={{ color: 'var(--body-mid)', fontSize: 10 }}>{b}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p style={{ marginTop: 18, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>
              HOVER A LAYER ABOVE TO INSPECT.
            </p>
          </div>
        </section>

        {/* Compliance */}
        <section style={{ padding: '80px 0', borderTop: '1px solid var(--hairline)' }}>
          <div className="container">
            <div className="section-head">
              <div>
                <span className="atlas-eyebrow">COMPLIANCE</span>
                <h2 style={{ marginTop: 18, fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 400, lineHeight: 1, letterSpacing: '-1.2px', maxWidth: 700, margin: '18px 0 0' }}>
                  Audited posture, on file.
                </h2>
              </div>
              <button className="atlas-btn">View trust center →</button>
            </div>
            <div className="grid-3">
              {[
                { t: 'SOC 2 TYPE II', s: 'Annual audit by independent firm. Report available under NDA.' },
                { t: 'ISO 27001',     s: 'Information security management system certified.' },
                { t: 'PCI DSS L1',    s: 'Atlas never sees PAN data; we observe settlement metadata only.' },
                { t: 'GDPR · DPA',    s: 'EU-resident data processed and stored in eu-west-1.' },
                { t: 'HIPAA · BAA',   s: 'Available for healthcare-fintech tenants on request.' },
                { t: 'FINRA TRACE',   s: 'Compatible export format for broker-dealer reporting.' },
              ].map(item => (
                <div key={item.t} className="atlas-card hover-lift" style={{ padding: 24, minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckIcon />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.3px' }}>{item.t}</span>
                  </div>
                  <p style={{ marginTop: 16, color: 'var(--body-mid)', fontSize: 13, lineHeight: '20px' }}>{item.s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audit trail */}
        <section style={{ padding: '80px 0', borderTop: '1px solid var(--hairline)' }}>
          <div className="container">
            <div className="section-head">
              <div>
                <span className="atlas-eyebrow">LIVE AUDIT TRAIL</span>
                <h2 style={{ marginTop: 18, fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 400, lineHeight: 1, letterSpacing: '-1.2px', maxWidth: 700, margin: '18px 0 0' }}>
                  Every decision is on the record.
                </h2>
                <p style={{ marginTop: 16, color: 'var(--body)', fontSize: 16, lineHeight: '24px', maxWidth: 560 }}>
                  The audit log is append-only and cryptographically chained. Operators, services, and break-glass actions are all recorded with full provenance.
                </p>
              </div>
            </div>

            <div className="atlas-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 80px 1fr 1.4fr 120px 120px', borderBottom: '1px solid var(--hairline)', background: 'var(--canvas-soft)' }}>
                {['ACTION ID', 'AGE', 'ACTOR', 'OPERATION', 'EVIDENCE', 'STATUS'].map(h => (
                  <div key={h} style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>{h}</div>
                ))}
              </div>
              {rows.map((r, i) => (
                <div key={r.id} style={{
                  display: 'grid', gridTemplateColumns: '120px 80px 1fr 1.4fr 120px 120px',
                  borderBottom: i < rows.length - 1 ? '1px solid var(--hairline)' : undefined,
                  animation: i === 0 ? 'rise 0.4s ease-out' : undefined,
                }}>
                  <div style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)' }}>{r.id}</div>
                  <div style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--body-mid)' }}>{r.t}</div>
                  <div style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--body)' }}>{r.actor}</div>
                  <div style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)' }}>{r.v}</div>
                  <div style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--body-mid)' }}>{r.evid}</div>
                  <div style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: toneColor(r.tone), display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: toneColor(r.tone) }} />
                    {r.tone === 'ok' ? 'OK' : r.tone === 'warn' ? 'WARN' : 'DRIFT'}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>
              STREAMING · UPDATES EVERY ~2.4S
            </p>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '100px 0', borderTop: '1px solid var(--hairline)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 400, lineHeight: 1.04, letterSpacing: '-1.2px', maxWidth: 600, margin: '0 auto' }}>
              Have a question about how we handle data?
            </h2>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/faq" className="atlas-btn atlas-btn--primary">Read the FAQ</Link>
              <button className="atlas-btn">Talk to security <ArrowIcon /></button>
            </div>
          </div>
        </section>

        <AtlasFooter />
      </div>
    </>
  )
}
