import FooterSection from "@/components/layouts/footer";
import HeroSection from "@/components/layouts/hero-section";
import { ModeToggle } from "@/components/ui/modeToggle";
import Solution from "@/components/layouts/solution";
import Features from "@/components/layouts/features";
import { HeroHeader } from "@/components/layouts/header";

function Home() {
  return (
    <div>
      <HeroHeader />
      <HeroSection />
      <ModeToggle />
      <Features/>
      <Solution/>
      <FooterSection />
    </div>
  );
}

export default Home;
