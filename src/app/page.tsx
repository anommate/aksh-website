import { Hero } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ServicesSection } from "@/components/sections/services";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <ServicesSection />
    </>
  );
}
