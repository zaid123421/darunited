import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/shared/components/brand/brand-mark";

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "DARUNITED — our new platform is on the way.",
};

export default function HomePage() {
  return (
    <div className="hero-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      <Link
        href="/login"
        className="btn-brand-outline absolute right-4 top-4 z-20 inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs sm:right-6 sm:top-6 sm:h-10 sm:px-5 sm:text-sm"
      >
        Admin Dashboard
      </Link>

      <div
        className="pointer-events-none absolute left-1/2 top-[68%] h-[300px] w-[320px] -translate-x-1/2 -translate-y-1/2 -rotate-[28deg] rounded-[40px] bg-accent/20 blur-3xl sm:h-[460px] sm:w-[480px]"
        aria-hidden
      />

      <div className="relative z-10 flex max-w-lg flex-col items-center">
        <BrandMark
          href={null}
          mark="full"
          surface="on-dark"
          size="xl"
          priority
          className="mx-auto object-center"
        />

        <p className="display-subtitle mt-8 uppercase tracking-[0.35em]">
          Coming Soon
        </p>

        <h1 className="display-title mt-4">Something new is coming</h1>

        <p className="mt-4 max-w-md text-[length:var(--text-body)] font-normal leading-relaxed text-foreground sm:text-base">
          We&apos;re building the DARUNITED platform — where brand, content, and
          community come together. Our website launches soon.
        </p>
      </div>
    </div>
  );
}
