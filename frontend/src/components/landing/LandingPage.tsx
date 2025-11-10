import { CTASection } from "@/components/landing/CTASection";
import { EconomySection } from "@/components/landing/EconomySection";
import { EngagementSection } from "@/components/landing/EngagementSection";
import { FeatureHighlights } from "@/components/landing/FeatureHighlights";
import { HeroSection } from "@/components/landing/HeroSection";
import { MixingShowcase } from "@/components/landing/MixingShowcase";
import { NFTCarousel } from "@/components/landing/NFTCarousel";
import { SocialSection } from "@/components/landing/SocialSection";

export const LandingPage = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-pink-100/60 via-white to-purple-100/40">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-pink-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-20 -z-10 h-[420px] w-[420px] rounded-full bg-purple-200/60 blur-3xl" />

      <HeroSection />
      <FeatureHighlights />
      <MixingShowcase />
      <NFTCarousel />
      <EconomySection />
      <SocialSection />
      <EngagementSection />
      <CTASection />
    </div>
  );
};

