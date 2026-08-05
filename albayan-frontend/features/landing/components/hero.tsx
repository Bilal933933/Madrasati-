import { HeroDemo } from "./hero-demo";
import { HeroText } from "./hero-text";

/**
 * قسم الـ Hero (البطل) في الصفحة العامة:
 * عمودان في الشاشات الكبيرة (نص + شاشة درس مصغّرة)
 * وعمود واحد على الشاشات الصغيرة (نص ثم معاينة).
 * الخلفية: مسار رحلة خفيف بنقاط (Progress Path) يرمز للتقدم.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -start-32 w-[420px] text-primary/10"
        viewBox="0 0 420 800"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M120 40 C 320 140, 60 260, 260 380 S 90 600, 210 760"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 10"
          strokeLinecap="round"
        />
        {[
          [120, 40],
          [205, 115],
          [240, 210],
          [185, 300],
          [230, 380],
          [160, 465],
          [195, 545],
          [150, 640],
          [200, 720],
        ].map(([cx, cy], index) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r={index === 4 ? 10 : 5} fill="currentColor" opacity={index === 4 ? 1 : 0.7} />
            <circle cx={cx} cy={cy} r={index === 4 ? 16 : 10} stroke="currentColor" opacity="0.25" />
          </g>
        ))}
      </svg>

      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -end-40 size-96 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-12">
        <HeroText />
        <HeroDemo />
      </div>
    </section>
  );
}
