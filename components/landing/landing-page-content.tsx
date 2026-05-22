import { FeatureCards } from "@/components/landing/feature-cards";
import { FinalCta } from "@/components/landing/final-cta";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingHeader } from "@/components/landing/landing-header";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { SocialProof } from "@/components/landing/social-proof";
import { ValueDisclaimer } from "@/components/landing/value-disclaimer";

export function LandingPageContent() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50">
      <LandingHeader />
      <HeroSection />
      <ScrollReveal>
        <FeatureCards />
      </ScrollReveal>
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>
      <ScrollReveal>
        <ValueDisclaimer />
      </ScrollReveal>
      <ScrollReveal>
        <SocialProof />
      </ScrollReveal>
      <ScrollReveal>
        <PricingPreview />
      </ScrollReveal>
      <ScrollReveal>
        <FinalCta />
      </ScrollReveal>
    </main>
  );
}
