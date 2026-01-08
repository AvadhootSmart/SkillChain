"use client";
import { FeaturesSectionWithHoverEffects } from "@/components/blocks/feature-section-with-hover-effects";
import Page from "@/components/pageWrapper";
import { Hero } from "@/components/ui/animated-hero";

export default function HomePage() {

  return (
    <>
      <Page>
        <Hero />
        <FeaturesSectionWithHoverEffects />
      </Page>
    </>
  );
}
