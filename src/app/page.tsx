import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { ScrollStory } from "@/components/landing/ScrollStory";
import { StatsBar } from "@/components/landing/StatsBar";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { PersonasSection } from "@/components/landing/PersonasSection";
import { FlowSection } from "@/components/landing/FlowSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { ReintegrationFinale } from "@/components/landing/ReintegrationFinale";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-rehub-950">
      <ScrollProgress />
      <Header />
      <Hero />
      <ScrollStory />
      <StatsBar />
      <ProblemSection />
      <SolutionSection />
      <PersonasSection />
      <FlowSection />
      <FAQSection />
      <ReintegrationFinale />
      <CTASection />
      <Footer />
    </main>
  );
}
