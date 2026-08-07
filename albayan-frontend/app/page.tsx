import { Achievements } from "@/features/landing/components/achievements";
import { FinalCta } from "@/features/landing/components/final-cta";
import { Faq } from "@/features/landing/components/faq";
import { LandingFooter } from "@/features/landing/components/footer";
import { Hero } from "@/features/landing/components/hero";
import { HowWeVerify } from "@/features/landing/components/how-we-verify";
import { InteractiveLesson } from "@/features/landing/components/interactive-lesson";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { ParentTeacher } from "@/features/landing/components/parent-teacher";
import { ProgressPath } from "@/features/landing/components/progress-path";
import { Results } from "@/features/landing/components/results";
import { StudentJourney } from "@/features/landing/components/student-journey";
import { Subjects } from "@/features/landing/components/subjects";
import { Testimonials } from "@/features/landing/components/testimonials";
import { WhyItWorks } from "@/features/landing/components/why-it-works";

const JOURNEY_STATIONS = [
  { icon: "Home", label: "البداية" },
  { icon: "BookOpen", label: "الدرس" },
  { icon: "ClipboardCheck", label: "التقييم" },
  { icon: "TrendingUp", label: "التحسن" },
  { icon: "GraduationCap", label: "الإتقان" },
  { icon: "Trophy", label: "الإنجاز" },
];

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="relative z-10 flex min-h-dvh flex-col">
        <LandingNavbar />
        <ProgressPath stations={JOURNEY_STATIONS} />

        <main className="flex flex-1 flex-col pt-10">
          <Hero />
          <HowWeVerify />
          <InteractiveLesson />
          <Results />
          <WhyItWorks />
          <Subjects />
          <Achievements />
          <ParentTeacher />
          <Testimonials />
          <StudentJourney />
          <Faq />
          <FinalCta />
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}
