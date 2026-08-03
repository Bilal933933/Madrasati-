import { Header } from "@/components/shared/header";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          أهلًا بك في مدرستي
        </h1>
        <p className="mt-3 text-center text-muted-foreground">
          منصتك التعليمية — الدروس والمناهج والتقييمات في مكان واحد.
        </p>
      </main>
    </div>
  );
}
