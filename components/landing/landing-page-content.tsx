import { FeatureCards } from "@/components/landing/feature-cards";
import { FinalCta } from "@/components/landing/final-cta";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingHeader } from "@/components/landing/landing-header";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { SocialProof } from "@/components/landing/social-proof";

export function LandingPageContent() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50">
      <LandingHeader />
      <HeroSection />
      <FeatureCards />
      <HowItWorks />
      <SocialProof />
      <PricingPreview />
      <FinalCta />
    </main>
  );
}
