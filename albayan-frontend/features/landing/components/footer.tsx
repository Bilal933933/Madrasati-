import { GraduationCap } from "lucide-react";
import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "عن المنصة",
    links: [
      { href: "#how-it-works", label: "فلسفة التعلم" },
      { href: "/explore", label: "المواد" },
      { href: "#faq", label: "الأسئلة الشائعة" },
    ],
  },
  {
    title: "الدعم",
    links: [
      { href: "#", label: "تواصل معنا" },
      { href: "#", label: "سياسة الخصوصية" },
      { href: "#", label: "الشروط والأحكام" },
    ],
  },
];

/**
 * فوتر البوابة: غني بأعمدة روابط مع حقوق النشر.
 */
export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-4" />
            </span>
            <span className="text-base font-bold tracking-tight">مدرستي</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            تعلم خطوة بخطوة حتى الإتقان — لأن كل طالب يستحق أن يتعلم بثقة.
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="mb-3 text-sm font-bold">{column.title}</h3>
            <nav className="flex flex-col gap-2">
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} مدرستي — جميع الحقوق محفوظة.</p>
          <p>صُنعت بحب للتعليم العربي.</p>
        </div>
      </div>
    </footer>
  );
}
