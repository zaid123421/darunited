import Image from "next/image";
import { NAV_ITEMS } from "@/modules/coming-soon/constants";

function ComingSoonLogo({
  className,
  preload = false,
}: {
  className?: string;
  preload?: boolean;
}) {
  return (
    <div className={className}>
      <Image
        src="/favicons/submark-red.png"
        alt=""
        width={46}
        height={46}
        preload={preload}
        aria-hidden
        className="shrink-0"
      />
      <div className="relative h-full min-w-0 flex-1">
        <Image
          src="/logos/wordmark-white.png"
          alt="DARUNITED"
          fill
          preload={preload}
          sizes="250px"
          className="object-contain object-left"
        />
      </div>
    </div>
  );
}

function ComingSoonBackground() {
  return (
    <Image
      src="/backgrounds/bg-with-cover.svg"
      alt=""
      fill
      preload
      unoptimized
      sizes="100vw"
      aria-hidden
      className="pointer-events-none object-cover object-center"
    />
  );
}

export function ComingSoonPage() {
  return (
    <div className="relative h-[1024px] overflow-hidden bg-background text-foreground">
      <ComingSoonBackground />

      <header className="absolute inset-x-0 top-0 z-20 flex h-[73.5px] items-center justify-between bg-[rgba(0,0,0,0.63)] px-[50px]">
        <ComingSoonLogo
          className="flex h-[53.5px] w-[249.66px] shrink-0 items-center gap-0 lg:gap-1.5"
          preload
        />

        <div className="flex items-center gap-6 lg:gap-8 xl:gap-10">
          <nav
            aria-hidden
            className="flex items-center gap-6 xl:gap-6.5"
          >
            {NAV_ITEMS.map((item) => (
              <span
                key={item}
                className="text-[18px] font-normal uppercase leading-none text-[rgba(217,214,214,1)]"
              >
                {item}
              </span>
            ))}
          </nav>

          <span className="inline-flex h-[41px] w-[151px] shrink-0 items-center justify-center bg-primary text-[16px] font-normal uppercase leading-none text-primary-foreground">
            Contact us
          </span>
        </div>
      </header>

      <main className="relative z-10 flex h-full flex-col overflow-hidden">
        <div className="relative z-10 flex flex-1 flex-col justify-center px-5 lg:px-16 xl:px-[50px] pt-[3%]">
          <div className="py-[10px]">
            <p className="text-[32px] font-medium uppercase leading-none text-[rgba(233,28,36,1)]">
              Built beyond steel
            </p>

            <h1 className="mt-2 font-heading text-[72px] font-semibold leading-[1.20] text-[rgba(255,255,255,1)]">
              Advanced Steel
              <br />
              Manufacturing
            </h1>
          </div>

          <p className="max-w-[720px] text-[24px] font-normal leading-[1.20] text-[rgba(255,255,255,1)]">
            Equipped with state-of-the-art industrial laser-cutting
            <br />
            and corrugating technology, DARUNITED manufactures
            <br />
            scalable, precision-built mechanical parts.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-5">
            <span className="inline-flex h-11 min-w-[300px] items-center justify-center bg-primary px-6 text-[11px] font-medium uppercase text-primary-foreground lg:min-w-[300px] lg:h-[56px] lg:text-[18px]">
              Explore products
            </span>
            <span className="inline-flex h-11 min-w-[300px] items-center justify-center bg-[#FAF9F859] px-6 text-[11px] font-medium uppercase text-[color:var(--du-white)]  lg:h-[56px] lg:min-w-[300px] lg:text-[18px]">
              Production
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
