import BackgroundSystem from "../components/BackgroundSystem";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CinematicWorkflowFilm from "../components/cinematic/workflow/CinematicWorkflowFilm";
import ProblemSection from "../components/ProblemSection";
import HowItWorks from "../components/HowItWorks";
import WhyAtlas from "../components/WhyAtlas";
import DesignPartners from "../components/DesignPartners";
import Footer from "../components/Footer";
import LiveOperations from "../components/LiveOperations";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen" style={{ background: "var(--ink)", color: "var(--text-primary)" }}>
      {/* Global interactive background — fixed, behind everything */}
      <BackgroundSystem />

      {/* Page content — sits above background */}
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <main>
          <Hero />
          <CinematicWorkflowFilm />
          <ProblemSection />
          <HowItWorks />
          <LiveOperations />
          <WhyAtlas />
          <DesignPartners />
        </main>
        <Footer />
      </div>
    </div>
  );
}
