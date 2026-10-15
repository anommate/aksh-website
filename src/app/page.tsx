import { Hero } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ServicesSection } from "@/components/sections/services";
import { SectionDivider } from "@/components/ui/section-divider";
import { ConsultantSection } from "@/components/sections/consultant";
import { ExperienceSection } from "@/components/sections/experience";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { FaqSection } from "@/components/sections/faq";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      {/*
        About keeps its own bottom padding (32/40/32px), so the divider adds
        only what balances it: about 40px either side on desktop and tablet,
        about 30px on mobile. The Services wordmark's lettering starts at the
        section top (its transparent margin is offset), so the padding below
        is the whole gap.
      */}
      <SectionDivider className="desktop:pt-8 pb-28 tablet:pb-40" />
      <ServicesSection />
      <ConsultantSection />
      <ExperienceSection />
      {/* Fictional samples: development and preview only, never production. */}
      <TestimonialsSection />
      {/* Every mode; follows The AKSH Experience where the samples are omitted. */}
      <FaqSection />
    </>
  );
}
