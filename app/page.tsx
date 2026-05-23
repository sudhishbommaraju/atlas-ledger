import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import Marquee from '@/components/landing/Marquee'
import ReconciliationSection from '@/components/landing/ReconciliationSection'
import ProblemSection from '@/components/landing/ProblemSection'
import SystemSection from '@/components/landing/SystemSection'
import CommandCenter from '@/components/landing/CommandCenter'
import AutoFixesDemo from '@/components/landing/AutoFixesDemo'
import PayoutDemo from '@/components/landing/PayoutDemo'
import SecuritySection from '@/components/landing/SecuritySection'
import DeveloperSection from '@/components/landing/DeveloperSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <div style={{ background: 'var(--base)', minHeight: '100vh' }}>
      <Nav />
      <Hero />
      <Marquee />
      <ReconciliationSection />
      <ProblemSection />
      <SystemSection />
      <CommandCenter />
      <AutoFixesDemo />
      <PayoutDemo />
      <SecuritySection />
      <DeveloperSection />
      <CTASection />
      <Footer />
    </div>
  )
}
