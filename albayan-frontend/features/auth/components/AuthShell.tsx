import { GraduationCap } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";

type AuthShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -end-32 size-72 rounded-full bg-primary/5 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -start-32 size-72 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="absolute top-4 end-4 z-20">
        <ThemeToggle />
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-10 sm:px-6">
        <div className="w-full max-w-md">
          <ScrollReveal>
            <div className="mb-8 flex flex-col items-center gap-3">
              <Link href="/" className="flex flex-col items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <GraduationCap className="size-6" />
                </span>
                <p className="text-lg font-bold tracking-tight">مدرستي</p>
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <Card className="md:rounded-3xl">
              <CardHeader className="items-center justify-items-center text-center">
                <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {title}
                </CardTitle>
                {description && (
                  <CardDescription className="sm:text-base">{description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>{children}</CardContent>
            </Card>
          </ScrollReveal>

          {footer && (
            <ScrollReveal delay={240}>
              <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
            </ScrollReveal>
          )}
        </div>
      </main>
    </div>
  );
}
