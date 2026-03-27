import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="content-area flex-1 pt-[100px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
