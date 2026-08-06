import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * سلسلة المسار (Breadcrumb) للاستكشاف — مسار تصفح طبيعي يوضح مكان الزائر.
 */
export function ExploreBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="مسار التنقل" className="flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.href}-${item.label}`} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronLeft className="size-3.5 text-muted-foreground rtl:rotate-180" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
