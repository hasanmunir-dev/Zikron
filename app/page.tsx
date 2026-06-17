import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { ProblemSection } from '@/components/landing/problem-section';
import { FeatureGrid } from '@/components/landing/feature-grid';
import { MarkdownSection } from '@/components/landing/markdown-section';
import { ListsSection } from '@/components/landing/lists-section';
import { RemindersSection } from '@/components/landing/reminders-section';
import { WorkflowSection } from '@/components/landing/workflow-section';
import { RoadmapSection } from '@/components/landing/roadmap-section';
import { CtaSection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <FeatureGrid />
        <MarkdownSection />
        <ListsSection />
        <RemindersSection />
        <WorkflowSection />
        <RoadmapSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
