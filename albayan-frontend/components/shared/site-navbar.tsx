"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type NavItem = {
  href?: string;
  onClick?: () => void;
  label: string;
  icon?: ReactNode;
};

type SiteNavbarProps = {
  /** اسم العلامة في الشعار (افتراضيًا "مدرستي"). */
  brandName?: string;
  /** وجهة الشعار (افتراضيًا "/"). */
  brandHref?: string;
  /** روابط الشاشات الكبيرة — تُعرض في منتصف البار. */
  links?: NavItem[];
  /** عناصر قائمة الجوال — تعرض أيقونات إن وُجدت. افتراضيًا = links. */
  mobileItems?: NavItem[];
  /** أزرار/محتوى الطرف المقابل في الشاشات الكبيرة (CTA، UserMenu، ThemeToggle…). */
  actions?: ReactNode;
  /** محتوى أسفل قائمة الجوال — دالة تستقبل close لإغلاق القائمة عند النقر. */
  mobileActions?: (close: () => void) => ReactNode;
  /** فئات إضافية على الحاوية الداخلية. */
  className?: string;
};

/**
 * الهيدر العام القابل لإعادة الاستخدام بنمط "الهيدر الذكي" (Smart Header):
 * - في أعلى الصفحة (قبل أي تمرير): بار شفاف مسطّح ملتصق بأعلى الصفحة وفي
 *   موضعه الطبيعي في تدفق الصفحة (لا يطفو فوق المحتوى).
 * - عند التمرير: يتحول إلى حبّة عائمة (Floating Pill) بحواف دائرية وضبابية
 *   خلفية ومرتبطة أعلى الشاشة.
 * كل مجموعة صفحات تمرر روابطها وأيقوناتها وأزرارها عبر props.
 * الأداء: اشتراك usePathname محصور في مكوّن NavLink (Leaf) — تنقّل المسار
 * يُحدّث الروابط فقط دون إعادة رسم الشعار والأزرار وقائمة الجوال.
 */
export function SiteNavbar({
  brandName = "مدرستي",
  brandHref = "/",
  links = [],
  mobileItems,
  actions,
  mobileActions,
  className,
}: SiteNavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const items = mobileItems ?? links;

  const closeSheet = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      setScrolled(y > 8);
      // لا نغيّر حالة الإخفاء إلا بحركة فعلية (أكثر من 2px) — عند توقف التمرير تبقى كما هي.
      if (Math.abs(delta) > 2) {
        setHidden(y > 120 && delta > 0);
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerHidden = hidden && !open;

  return (
    <header
      className={cn(
        "sticky z-50 px-4 transition-transform duration-300",
        scrolled ? "top-2" : "top-0 pt-3",
        headerHidden && "-translate-y-[calc(100%+1rem)]"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between transition-all duration-300",
          scrolled
            ? "rounded-full border border-white/10 bg-foreground/10 px-5 py-2.5 shadow-2xl backdrop-blur-md sm:px-6"
            : "border-b bg-background/85 px-2 py-2.5 backdrop-blur sm:px-3",
          className
        )}
      >
        {/* الشعار */}
        <Link href={brandHref} className="-m-1.5 flex items-center gap-2.5 rounded-full p-1.5">
          <BrandMark className="size-9" />
          <span className="hidden text-lg font-bold tracking-tight text-foreground sm:inline">
            {brandName}
          </span>
        </Link>

        {/* روابط الأقسام (الشاشات الكبيرة) */}
        {links.length > 0 && (
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
            {links.map((link) => (
              <NavLink
                key={link.label}
                link={link}
                className="transition-colors hover:text-foreground"
              />
            ))}
          </nav>
        )}

        {/* الأزرار + قائمة الجوال */}
        <div className="flex items-center gap-2">
          {actions}

          {items.length > 0 || mobileActions ? (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="size-11 lg:hidden" aria-label="القائمة">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetTitle className="sr-only">قائمة التنقل</SheetTitle>
                <div className="flex items-center gap-2 px-4 pt-2">
                  <BrandMark className="size-8" iconClassName="size-4" />
                  <span className="text-base font-bold tracking-tight">{brandName}</span>
                </div>

                {items.length > 0 && (
                  <nav className="flex flex-col gap-1 px-2 pt-4">
                    {items.map((item) => (
                      <NavLink
                        key={item.label}
                        link={item}
                        close={closeSheet}
                        className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      />
                    ))}
                  </nav>
                )}

                {mobileActions && (
                  <div className="mt-auto flex flex-col gap-2 p-4">
                    {mobileActions(closeSheet)}
                  </div>
                )}
              </SheetContent>
            </Sheet>
          ) : null}
        </div>
      </div>
    </header>
  );
}

/**
 * رابط ورقي (Leaf) — المكوّن الوحيد المشترك في usePathname.
 * الروابط #hash (الواجهة) لا تُعتبر نشطة أبدًا؛ التطابق تام أو بادئة للمسارات.
 */
const NavLink = memo(function NavLink({
  link,
  close,
  className,
}: {
  link: NavItem;
  close?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  const isActive =
    link.href !== undefined &&
    !link.href.startsWith("#") &&
    (pathname === link.href || pathname.startsWith(`${link.href}/`));

  const classes = cn(className, isActive && "text-primary hover:text-primary");

  const content = (
    <>
      {close && link.icon ? <span className="text-primary">{link.icon}</span> : null}
      <span>{link.label}</span>
    </>
  );

  if (link.href) {
    return (
      <Link
        href={link.href}
        onClick={close}
        className={classes}
        aria-current={isActive ? "page" : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        link.onClick?.();
        close?.();
      }}
      className={classes}
      aria-current={isActive ? "page" : undefined}
    >
      {content}
    </button>
  );
});