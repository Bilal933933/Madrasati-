import { ChevronLeft, Library } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { EXPLORE_ICONS } from "../lib/exploreIcons";
import { ExploreThumb } from "./ExploreThumb";

/**
 * بطاقة عنصر استكشاف بنمط أقسام /home المتناوبة (Open Canvas):
 * في الجهاز تظهر الصورة فوق النص، ومن lg يتناوب النص/الصورة كل بطاقة
 * (معلومة جانب + صورة في المقابل) بلا إطارات صلبة.
 */
export function ExploreItemCard({
  index,
  href,
  title,
  description,
  meta,
  image,
  icon,
}: {
  index: number;
  href: string;
  title: string;
  description: string;
  meta: string;
  image: string | null;
  icon: string | null;
  color: string | null;
}) {
  const isEven = index % 2 === 0;
  const Icon = EXPLORE_ICONS[icon ?? ""] ?? Library;

  return (
    <ScrollReveal delay={index * 120}>
      <Link href={href} className="group grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
      {/* الصورة / الكولباك — تُعرض دائمًا */}
      <div
        className={cn(
          "relative col-span-1 aspect-[16/10] overflow-hidden rounded-3xl lg:col-span-7 lg:aspect-auto lg:min-h-72",
          isEven ? "lg:order-2" : "lg:order-1",
        )}
      >
        <ExploreThumb
          image={image}
          fallbackImage="/images/subject-fallback.jpg"
          className="absolute inset-0 size-full rounded-none object-cover transition-transform duration-700 group-hover:scale-105"
          alt={title}
          fallback={
            <span className="absolute inset-0 flex items-center justify-center bg-muted">
              <Icon className="size-16 text-muted-foreground" aria-hidden />
            </span>
          }
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />
      </div>

      {/* المحتوى */}
      <div
        className={cn(
          "flex flex-col gap-3 p-2 lg:col-span-5",
          isEven ? "lg:order-1 lg:pe-10" : "lg:order-2 lg:ps-10",
        )}
      >
        <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Icon className="me-1.5 size-3.5" aria-hidden />
          {meta}
        </span>
        <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight">
          <Icon className="size-6 shrink-0 text-primary" aria-hidden />
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
          استعراض
          <ChevronLeft
            className="size-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
      </Link>
    </ScrollReveal>
  );
}