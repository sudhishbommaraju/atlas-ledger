"use client";
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const STEPS = [
  {
    n:'01', label:'Ingest',
    title:'Every source, unified',
    desc:'Stripe, Adyen, ERP, bank files, and processor exports are ingested through a single API. Schema validated. Duplicates rejected. Every row accounted for.',
    tags:['stripe','adyen','erp','bank','manual'],
  },
  {
    n:'02', label:'Reconcile',
    title:'Cross-source matching',
    desc:'Atlas matches settlements to charges across sources, identifies gaps, and routes anomalies to the exception queue — automatically, without spreadsheets.',
    tags:['settlement_match','gap_detection','exception_routing'],
  },
  {
    n:'03', label:'Compute',
    title:'True disbursable balance',
    desc:'Paper balance minus every active blocker — unsettled funds, reserves, refunds in flight, open exceptions, pending fees — gives you the payoutable amount.',
    formula:'paper − (settlements + reserves + refunds + exceptions + fees)',
  },
  {
    n:'04', label:'Decide',
    title:'Payout verdict with proof',
    desc:'SAFE. PARTIAL. BLOCKED. Every verdict is computed from live ledger state with a full explanation. No guessing. No overrides. Institutional-grade certainty.',
    verdicts:[
      {v:'SAFE',    c:'#6B9E86', d:'Payoutable > 0 · no active blockers'},
      {v:'PARTIAL', c:'#B8784A', d:'Payoutable > 0 · blockers active'},
      {v:'BLOCKED', c:'#A84A42', d:'Payoutable = 0'},
    ],
  },
  {
    n:'05', label:'Execute',
    title:'Payout orchestration',
    desc:'Route disbursements across ACH, Wire, and SWIFT rails. Atlas handles batching, retry logic, and writes confirmations back to the immutable audit ledger.',
    rails:['ACH','Wire','SWIFT'],
  },
]

const TAG = ({children, color='rgba(198,166,107,0.12)', textColor='#C6A66B'}) => (
  <span style={{
    display:'inline-flex',alignItems:'center',
    padding:'3px 8px',borderRadius:2,
    background:color,color:textColor,
    fontSize:'0.6rem',fontWeight:500,
    fontFamily:'JetBrains Mono,Menlo,monospace',
    border:`1px solid ${color.replace('0.12','0.2')}`,
    letterSpacing:'0.06em',
  }}>{children}</span>
)

function StepCard({step, i}) {
  const ref = useRef(null)
  const iv  = useInView(ref, {once:true, margin:'-80px'})

  return (
    <motion.div
      ref={ref}
      initial={{opacity:0,y:20}} animate={iv?{opacity:1,y:0}:{}}
      transition={{duration:0.7,delay:i*0.08,ease:[0.22,1,0.36,1]}}
      className="lift"
      style={{
        padding:'36px 40px',
        borderBottom:'1px solid var(--border)',
        background:'var(--cream)',
        cursor:'default',
      }}
      whileHover={{background:'#F3EFE8'}}
    >
      <div style={{display:'flex',gap:32,alignItems:'flex-start'}}>
        {/* Step number */}
        <div style={{
          fontFamily:'JetBrains Mono,Menlo,monospace',
          fontSize:'0.6rem',color:'#B89B5E',
          letterSpacing:'0.14em',
          paddingTop:4,
          minWidth:24,
          opacity:0.7,
        }}>{step.n}</div>

        {/* Content */}
        <div style={{flex:1}}>
          <div style={{
            fontSize:'0.6rem',fontWeight:600,letterSpacing:'0.2em',
            textTransform:'uppercase',color:'#9A9490',marginBottom:8,
          }}>
            {step.label}
          </div>
          <h3 style={{fontSize:'1.15rem',fontWeight:600,color:'#0B0C0E',letterSpacing:'-0.02em',marginBottom:10,lineHeight:1.3}}>
            {step.title}
          </h3>
          <p style={{fontSize:'0.82rem',color:'#7A756F',lineHeight:1.6,maxWidth:540,marginBottom:16}}>
            {step.desc}
          </p>

          {/* Tags */}
          {step.tags && (
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {step.tags.map(t=><TAG key={t}>{t}</TAG>)}
            </div>
          )}

          {/* Formula */}
          {step.formula && (
            <div style={{
              fontFamily:'JetBrains Mono,Menlo,monospace',
              fontSize:'0.68rem',color:'#C6A66B',
              background:'rgba(198,166,107,0.06)',
              border:'1px solid rgba(198,166,107,0.12)',
              borderRadius:3,padding:'10px 14px',
              lineHeight:1.5,marginTop:8,
            }}>
              payoutable = {step.formula}
            </div>
          )}

          {/* Verdicts */}
          {step.verdicts && (
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              {step.verdicts.map(({v,c,d})=>(
                <motion.div
                  key={v}
                  whileHover={{y:-2,boxShadow:'0 4px 12px rgba(0,0,0,0.06)'}}
                  style={{
                    border:`1px solid ${c}30`,
                    borderRadius:3,padding:'10px 14px',
                    transition:'all 0.2s ease',cursor:'default',
                    background:`${c}08`,
                  }}
                >
                  <div style={{fontSize:'0.7rem',fontWeight:700,color:c,letterSpacing:'0.1em',marginBottom:4}}>{v}</div>
                  <div style={{fontSize:'0.62rem',color:'#7A756F',fontFamily:'JetBrains Mono,Menlo,monospace'}}>{d}</div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Rails */}
          {step.rails && (
            <div style={{display:'flex',gap:8}}>
              {step.rails.map((r,i)=>(
                <TAG key={r}
                  color={['rgba(107,158,134,0.1)','rgba(198,166,107,0.1)','rgba(184,120,74,0.1)'][i]}
                  textColor={['#6B9E86','#C6A66B','#B8784A'][i]}>
                  {r}
                </TAG>
              ))}
            </div>
          )}
        </div>

        {/* Step indicator dot */}
        <div style={{
          width:8,height:8,borderRadius:'50%',
          background:'#DAD5CD',
          marginTop:5,flexShrink:0,
        }}/>
      </div>
    </motion.div>
  )
}

export default function ArchitectureSection() {
  const ref = useRef(null)
  const iv  = useInView(ref, {once:true, margin:'-100px'})

  return (
    <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: "easeOut" }} className="section-cream" style={{borderTop:'1px solid var(--border)'}}>
      {/* Section header */}
      <div className="max-w-[1440px] mx-auto px-8 md:px-12 py-24 pb-0">
        <div ref={ref} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'end',marginBottom:64}}>
          <div>
            <motion.div
              initial={{opacity:0,y:10}} animate={iv?{opacity:1,y:0}:{}}
              transition={{duration:0.6}}
              className="label mb-5"
            >03 — Architecture</motion.div>
            <motion.h2
              initial={{opacity:0,y:14}} animate={iv?{opacity:1,y:0}:{}}
              transition={{duration:0.8,delay:0.1,ease:[0.22,1,0.36,1]}}
              style={{fontSize:'clamp(2rem,3.2vw,2.8rem)',fontWeight:600,
                letterSpacing:'-0.03em',lineHeight:0.98,color:'#0B0C0E'}}
            >
              Five layers.<br/>
              <span style={{color:'#9A9490'}}>One source of truth.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{opacity:0}} animate={iv?{opacity:1}:{}}
            transition={{duration:0.7,delay:0.25}}
            style={{fontSize:'0.9rem',color:'#7A756F',lineHeight:1.7,maxWidth:460}}
          >
            Atlas doesn't bolt on a reconciliation layer. It is the reconciliation layer —
            a complete operational system from raw financial event to confirmed payout
            with an immutable audit trail at every stage.
          </motion.p>
        </div>
      </div>

      {/* Steps */}
      <div style={{borderTop:'1px solid var(--border)'}}>
        {STEPS.map((step,i)=>(
          <StepCard key={step.n} step={step} i={i}/>
        ))}
      </div>

      {/* Trust row — Mercury-style */}
      <div className="max-w-[1440px] mx-auto px-8 md:px-12 py-20"
        style={{borderTop:'1px solid var(--border)'}}>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(4,1fr)',
          gap:0,
          border:'1px solid var(--border)',
          borderRadius:4,
          overflow:'hidden',
        }}>
          {[
            {label:'Immutable audit ledger',   detail:'Every operation logged with full lineage'},
            {label:'Sub-second reconciliation',detail:'Real-time balance on every committed event'},
            {label:'Multi-source dedup',        detail:'External ID uniqueness enforced by schema'},
            {label:'Decimal-exact arithmetic',  detail:'Numeric(18,2) — no floating-point error'},
          ].map(({label,detail},i)=>(
            <motion.div
              key={label}
              whileHover={{background:'#F3EFE8'}}
              style={{
                padding:'28px 32px',
                borderRight: i<3 ? '1px solid var(--border)' : 'none',
                cursor:'default',
                transition:'background 0.2s ease',
              }}
            >
              <div style={{
                width:24,height:1,background:'#B89B5E',
                marginBottom:16,opacity:0.7,
              }}/>
              <div style={{fontSize:'0.82rem',fontWeight:500,color:'#0B0C0E',marginBottom:8,lineHeight:1.3}}>{label}</div>
              <div style={{fontSize:'0.7rem',color:'#7A756F',lineHeight:1.5}}>{detail}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
