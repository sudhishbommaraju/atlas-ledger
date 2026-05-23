import Nav                  from './components/Nav'
import Hero                 from './components/Hero'
import Marquee              from './components/Marquee'
import ReconciliationSection from './components/ReconciliationSection'
import ProblemSection       from './components/ProblemSection'
import SystemSection        from './components/SystemSection'
import CommandCenter        from './components/CommandCenter'
import AutoFixesDemo        from './components/AutoFixesDemo'
import PayoutDemo           from './components/PayoutDemo'
import SecuritySection      from './components/SecuritySection'
import DeveloperSection     from './components/DeveloperSection'
import CTASection           from './components/CTASection'
import Footer               from './components/Footer'

export default function App() {
  return (
    <div style={{ background: 'var(--base)', minHeight: '100vh' }}>
      <Nav />
      <Hero />
      <Marquee />
      <ReconciliationSection />   {/* Live Workflow — cursor-driven drag + reconcile */}
      <ProblemSection />          {/* The Problem — fragmented data chaos */}
      <SystemSection />           {/* The System — 5-step interactive pipeline */}
      <CommandCenter />           {/* Command Center — live kanban + operators + log */}
      <AutoFixesDemo />           {/* Auto Fixes — exception resolution */}
      <PayoutDemo />              {/* Payout Execution — multi-rail disbursement */}
      <SecuritySection />         {/* Security — immutable ledger + RBAC + compliance */}
      <DeveloperSection />        {/* Developers — API reference + code samples */}
      <CTASection />              {/* Final CTA — invitation-only access */}
      <Footer />
    </div>
  )
}
