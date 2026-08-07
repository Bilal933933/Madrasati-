import type { ReactNode } from "react";

/**
 * هيدر صفحة استكشاف بنمط Open Canvas انسيابي (نفس لغة صفحة المادة):
 * توهّج عائم خلفي + شارة ثيم + عنوان كبير + وصف، بدون بطاقات/فواصل صلبة.
 */
export function ExploreHero({
  badge,
  title,
  description,
}: {
  badge: string;
  title: ReactNode;
  description: string;
}) {
  return (
    <header className="relative mt-6 overflow-hidden">
      <div className="pointer-events-none absolute end-1/3 top-10 size-72 rounded-full bg-primary/15 opacity-40 blur-3xl" />

      <div className="relative max-w-2xl">
        <span className="inline-flex w-fit items-center rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-foreground/80">
          {badge}
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
    </header>
  );
}
