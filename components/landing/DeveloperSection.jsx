"use client";
import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const ENDPOINTS = [
  { method: 'POST', path: '/reconcile',     desc: 'Trigger reconciliation run',     color: 'var(--sage)'    },
  { method: 'GET',  path: '/balance',       desc: 'Get verified payoutable balance', color: 'var(--gold)'    },
  { method: 'POST', path: '/payout',        desc: 'Execute approved payout',         color: 'var(--sage)'    },
  { method: 'GET',  path: '/exceptions',    desc: 'List open exceptions',            color: 'var(--gold)'    },
  { method: 'POST', path: '/autofix',       desc: 'Resolve exception automatically', color: 'var(--amber)'   },
  { method: 'GET',  path: '/audit-log',     desc: 'Retrieve immutable audit trail',  color: 'var(--gold)'    },
]

const CODE_SAMPLES = {
  reconcile: `curl -X POST https://api.atlasledger.io/reconcile \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "source": "stripe",
    "date": "2024-01-15",
    "format": "csv"
  }'`,
  balance: `curl https://api.atlasledger.io/balance \\
  -H "Authorization: Bearer sk_live_..."

# Response
{
  "paper_balance": 2410000,
  "blocked": 480000,
  "payoutable": 1930000,
  "verdict": "PARTIAL",
  "computed_at": "2024-01-15T09:14:32Z"
}`,
  payout: `curl -X POST https://api.atlasledger.io/payout \\
  -H "Authorization: Bearer sk_live_..." \\
  -d '{
    "amount": 1930000,
    "currency": "USD",
    "rail": "ACH",
    "payee_id": "py_acme_corp",
    "idempotency_key": "pyt_20240115"
  }'`,
}

const INTEGRATIONS = ['Stripe', 'Adyen', 'Braintree', 'PayPal', 'Square', 'Worldpay', 'Checkout.com', 'Klarna']

const METHOD_COLOR = { GET: 'var(--sage)', POST: 'var(--gold)', DELETE: 'var(--scarlet)' }

export default function DeveloperSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [activeTab, setActiveTab] = useState('reconcile')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText(CODE_SAMPLES[activeTab] || CODE_SAMPLES.reconcile)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: "easeOut" }} ref={ref} className="section" style={{ background: 'var(--base)', position: 'relative', overflow: 'hidden' }}>
      <div className="grid-dark" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 50% 60% at 80% 50%, rgba(198,166,107,0.05) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ position: 'relative' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ maxWidth: 520, marginBottom: 60 }}
        >
          <div className="label-gold" style={{ marginBottom: 16 }}>Developers</div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 700,
            color: 'var(--chalk)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 16,
          }}>
            REST API. Webhooks.<br />Complete OpenAPI spec.
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--stone)', lineHeight: 1.7 }}>
            Production-ready API with full Swagger documentation. Integrate reconciliation and payout decisioning into any stack in an afternoon.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, alignItems: 'start' }}>

          {/* Left — endpoint list */}
          <div>
            {/* Integration logos */}
            <div style={{ marginBottom: 20 }}>
              <div className="label" style={{ marginBottom: 12 }}>PSP Connectors</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {INTEGRATIONS.map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: i * 0.05 + 0.1 }}
                    whileHover={{ borderColor: 'var(--line-3)', background: 'rgba(255,255,255,0.03)' }}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--elevated)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      fontSize: '0.68rem',
                      color: 'var(--silver)',
                      cursor: 'default',
                      transition: 'all 0.18s ease',
                    }}
                  >{name}</motion.div>
                ))}
              </div>
            </div>

            {/* Endpoints */}
            <div className="label" style={{ marginBottom: 12 }}>API Reference</div>
            <div style={{
              background: 'var(--raised)',
              border: '1px solid var(--line)',
              borderRadius: 14,
              overflow: 'hidden',
            }}>
              {ENDPOINTS.map(({ method, path, desc, color }, i) => (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.07 + 0.2 }}
                  whileHover={{ background: 'rgba(255,255,255,0.025)' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderBottom: i < ENDPOINTS.length - 1 ? '1px solid var(--line)' : 'none',
                    cursor: 'default',
                    transition: 'background 0.18s ease',
                  }}
                >
                  <span className="mono" style={{
                    fontSize: '0.55rem', fontWeight: 700,
                    color: METHOD_COLOR[method] || 'var(--stone)',
                    minWidth: 32,
                  }}>{method}</span>
                  <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--chalk)', flex: 1 }}>{path}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--stone)' }}>{desc}</span>
                </motion.div>
              ))}
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <motion.a
                href="http://localhost:8000/docs" target="_blank" rel="noreferrer"
                whileHover={{ y: -1 }}
                className="btn-gold"
                style={{ fontSize: '0.72rem', padding: '9px 18px' }}
              >Swagger UI →</motion.a>
              <motion.a
                href="http://localhost:8000/openapi.json" target="_blank" rel="noreferrer"
                whileHover={{ y: -1 }}
                className="btn-ghost"
                style={{ fontSize: '0.72rem', padding: '9px 18px' }}
              >OpenAPI JSON</motion.a>
            </div>
          </div>

          {/* Right — code panel */}
          <div style={{
            background: 'var(--raised)',
            border: '1px solid var(--line)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* Chrome */}
            <div className="chrome">
              <div className="chrome-dots">
                <span style={{ background: '#A84A42' }} />
                <span style={{ background: '#B8784A' }} />
                <span style={{ background: '#6B9E86' }} />
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {Object.keys(CODE_SAMPLES).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '3px 10px',
                      background: activeTab === tab ? 'rgba(198,166,107,0.1)' : 'transparent',
                      border: '1px solid',
                      borderColor: activeTab === tab ? 'rgba(198,166,107,0.25)' : 'transparent',
                      borderRadius: 5,
                      color: activeTab === tab ? 'var(--gold)' : 'var(--stone)',
                      fontSize: '0.58rem',
                      cursor: 'pointer',
                      fontFamily: 'JetBrains Mono, Menlo, monospace',
                      transition: 'all 0.15s ease',
                    }}
                  >/{tab}</button>
                ))}
              </div>
              <motion.button
                onClick={handleCopy}
                whileHover={{ color: 'var(--silver)' }}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: '0.56rem', color: copied ? 'var(--sage)' : 'var(--stone)',
                  fontFamily: 'JetBrains Mono, Menlo, monospace',
                  transition: 'color 0.15s ease',
                }}
              >{copied ? 'copied!' : 'copy'}</motion.button>
            </div>

            {/* Code */}
            <div style={{ padding: '20px 22px', minHeight: 220 }}>
              <AnimatePresence mode="wait">
                <motion.pre
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontFamily: 'JetBrains Mono, Menlo, monospace',
                    fontSize: '0.68rem',
                    lineHeight: 1.7,
                    color: 'var(--silver)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                  }}
                >
                  {(CODE_SAMPLES[activeTab] || CODE_SAMPLES.reconcile).split('\n').map((line, i) => {
                    const isComment = line.trim().startsWith('#')
                    const isKey = line.match(/^\s+"[\w_]+"/)
                    const isString = line.includes('"') && !isKey
                    return (
                      <div key={i} style={{
                        color: isComment ? 'var(--stone)' :
                               isKey     ? 'var(--gold)' :
                               line.includes('curl') ? 'var(--sage)' :
                               'var(--silver)',
                      }}>{line}</div>
                    )
                  })}
                </motion.pre>
              </AnimatePresence>
            </div>

            {/* Footer stats */}
            <div style={{
              borderTop: '1px solid var(--line)',
              padding: '12px 22px',
              display: 'flex',
              gap: 24,
            }}>
              {[
                { l: 'Response time', v: '< 100ms' },
                { l: 'Uptime',        v: '99.99%'  },
                { l: 'API version',   v: 'v1.0'    },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--chalk)', fontWeight: 600 }}>{v}</div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--stone)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
