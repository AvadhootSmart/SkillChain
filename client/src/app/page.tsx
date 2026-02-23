"use client";
import { FeaturesSectionWithHoverEffects } from "@/components/blocks/feature-section-with-hover-effects";
import Page from "@/components/pageWrapper";
import { Hero } from "@/components/ui/animated-hero";
import { DevTestingButtons } from "@/components/dev-testing-buttons";

export default function HomePage() {

  return (
    <>
      <Page>
        <Hero />
        <FeaturesSectionWithHoverEffects />
        <DevTestingButtons />
      </Page>
    </>
  );
}
