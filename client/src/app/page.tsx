"use client";
import { FeaturesSectionWithHoverEffects } from "@/components/blocks/feature-section-with-hover-effects";
import { Navbar } from "@/components/navbar";
import Page from "@/components/pageWrapper";
import { Hero } from "@/components/ui/animated-hero";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Page>
        <Hero />
        <FeaturesSectionWithHoverEffects />
      </Page>
    </>
  );
}
