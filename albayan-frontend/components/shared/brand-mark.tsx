import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * علامة المنصة الموحّدة — أيقونة دائرة ذهبية بحرف التخرج.
 * تستخدم في SiteNavbar و AuthShell و أي مكان يُعرض فيه الشعار.
 */
export function BrandMark({
  className,
  iconClassName = "size-5",
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[#D8B486] text-black",
        className
      )}
    >
      <GraduationCap className={cn("size-5", iconClassName)} aria-hidden />
    </span>
  );
}
