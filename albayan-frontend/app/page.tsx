import { Hero } from "@/features/landing/components/hero";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <LandingNavbar />

      <main className="flex flex-1 flex-col">
        <Hero />
      </main>
    </div>
  );
}
