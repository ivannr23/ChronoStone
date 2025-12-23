import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import PricingTable from '@/components/landing/PricingTable'
import Testimonials from '@/components/landing/Testimonials'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <PricingTable />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}

