'use client'
import FeaturesSection from "../components/FeaturesSection"
import LocationsSection from "../components/LocationsSection"
import VPSPricingSection from "../components/vps/VPSPricingSection"
import OSSelectionSection from "../components/vps/OSSelectionSection"
import FAQSection from "../components/FAQSection"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar";
import PanelShowcase from "../components/PanelShowcase"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] transition-colors duration-300">
      <Navbar />
      <VPSPricingSection />
      <OSSelectionSection />
      <FeaturesSection />
      <LocationsSection />
      <FAQSection />
      <PanelShowcase />
      <Footer />
    </div>
  )
}
