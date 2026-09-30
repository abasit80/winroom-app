"use client";

import { Navbar } from "@/components/landing/navbar";
import { LandingOrbit } from "@/components/landing/landing-orbit";
import { IntelligenceFlow } from "@/components/landing/intelligence-flow";
import { Features } from "@/components/landing/features";
import { PlatformPreview } from "@/components/landing/platform-preview";
import { TrustedBy } from "@/components/landing/trusted-by";
import { SiteFooter } from "@/components/landing/site-footer";
import { PageFx } from "@/components/visuals/page-fx";
import { Reveal } from "@/components/visuals/reveal";

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-canvas">
      <PageFx />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <Reveal>
          <LandingOrbit />
        </Reveal>
        <Reveal delay={0.08}>
          <IntelligenceFlow />
        </Reveal>
        <Reveal delay={0.05}>
          <TrustedBy />
        </Reveal>
        <Reveal>
          <Features />
        </Reveal>
        <Reveal delay={0.06}>
          <PlatformPreview />
        </Reveal>
        <SiteFooter />
      </div>
    </div>
  );
}
