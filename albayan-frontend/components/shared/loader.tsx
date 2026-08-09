import "./loader.css";
import { cn } from "@/lib/utils";

type LoaderProps = {
  caption?: string;
  /** يُطبَّق على غلاف الـ Loader (وهو fixed) — مفيد لتعديل موقعه مثل translate-y. */
  className?: string;
  /** بتنسيق داخل المحتوى (main) بدل ملء الشاشة — لا يغطي النافبار/الفوتر. */
  inline?: boolean;
};

export function Loader({
  caption = "جارٍ التحميل...",
  className,
  inline = false,
}: LoaderProps) {
  return (
    <div
      className={cn(inline ? "md-loader-inline" : "md-loader", className)}
      role="status"
    >
      <div className="md-loader-main">
        <div className="md-loader-up">
          <div className="md-loader-bar-group">
            {Array.from({ length: 10 }).map((_, i) => (
              <div className="md-loader-bar" key={i} />
            ))}
          </div>
          <div className="md-loader-ball-group">
            {Array.from({ length: 9 }).map((_, i) => (
              <div className="md-loader-ball-wrap" key={i}>
                <div className={`md-loader-ball md-loader-ball-${i}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {caption && (
        <p className="text-sm text-muted-foreground">{caption}</p>
      )}
    </div>
  );
}