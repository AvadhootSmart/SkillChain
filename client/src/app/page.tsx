"use client";
import { FeaturesSectionWithHoverEffects } from "@/components/blocks/feature-section-with-hover-effects";
import { HowItWorks } from "@/components/blocks/how-it-works";
import Page from "@/components/pageWrapper";
import { Hero } from "@/components/ui/animated-hero";
import { Footer } from "@/components/footer";

export default function HomePage() {

  return (
    <>
      <Page>
        <Hero />
        <FeaturesSectionWithHoverEffects />
        <HowItWorks />
        <Footer />
      </Page>
    </>
  );
}
