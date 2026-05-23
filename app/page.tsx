import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import ReconciliationDemo from '@/components/landing/ReconciliationDemo'
import ProblemSection from '@/components/landing/ProblemSection'
import ExceptionResolution from '@/components/landing/ExceptionResolution'
import SafeToDisburse from '@/components/landing/SafeToDisburse'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <ReconciliationDemo />
      <ProblemSection />
      <ExceptionResolution />
      <SafeToDisburse />
      <CTASection />
      <Footer />
    </>
  )
}
