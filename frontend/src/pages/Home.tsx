import { Navbar } from '../components/home/Navbar';
import { HeroSection } from '../components/home/HeroSection';
import { StatsSection } from '../components/home/StatsSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { ExamPreviewSection } from '../components/home/ExamPreviewSection';
import { HomeFooter } from '../components/home/HomeFooter';

export function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <ExamPreviewSection />
      </main>
      <HomeFooter />
    </div>
  );
}
