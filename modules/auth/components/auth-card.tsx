import { BrandMark } from "@/shared/components/brand/brand-mark";

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh w-full overflow-hidden bg-background">
      {/* Ambient backdrop — mobile / shared */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_10%_-10%,color-mix(in_srgb,var(--du-red)_22%,transparent),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,color-mix(in_srgb,var(--du-grey)_12%,transparent),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(var(--du-white) 1px, transparent 1px), linear-gradient(90deg, var(--du-white) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
          }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col lg:flex-row lg:items-stretch">
        {/* Brand column */}
        <aside className="relative flex flex-col justify-between px-6 pb-4 pt-8 sm:px-10 sm:pt-10 lg:w-[46%] lg:px-12 lg:py-14 xl:px-16">
          <div className="pointer-events-none absolute inset-y-8 left-0 hidden w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent lg:block" />

          <div className="animate-auth-enter">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:mb-6">
              Staff portal
            </p>

            <BrandMark
              href="/"
              mark="full"
              surface="on-dark"
              size="xl"
              priority
              className="object-left"
            />

            <div className="mt-8 hidden max-w-sm lg:block">
              <div
                className="mb-5 h-0.5 w-12 origin-left animate-auth-line bg-primary"
                aria-hidden
              />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Sign in with your work email to manage content across the
                DARUNITED platform.
              </p>
            </div>
          </div>

          <p className="mt-10 hidden text-[11px] tracking-wide text-muted-foreground/50 lg:block">
            © {new Date().getFullYear()} DARUNITED
          </p>
        </aside>

        {/* Form column */}
        <main className="relative flex flex-1 items-start justify-center px-4 pb-10 sm:px-8 sm:pb-14 lg:items-center lg:px-10 lg:py-14 xl:px-14">
          <div className="animate-auth-enter-delayed w-full max-w-[400px]">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/80 p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)] backdrop-blur-md sm:p-8">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
                aria-hidden
              />

              {children}
            </div>

            <p className="mt-6 text-center text-[11px] text-muted-foreground/60 lg:hidden">
              © {new Date().getFullYear()} DARUNITED
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
