import Image, { getImageProps } from "next/image";
import { INQUIRY_EMAIL, SOCIAL_LINKS } from "@/modules/coming-soon/constants";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
} from "@/modules/coming-soon/components/social-icons";
import { cn } from "@/shared/lib/cn";

const socialIcons = {
  Facebook: FacebookIcon,
  LinkedIn: LinkedInIcon,
  Instagram: InstagramIcon,
} as const;

function ComingSoonLogo({
  className,
  preload = false,
}: {
  className?: string;
  preload?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-0.5 lg:gap-5", className)}>
      <Image
        src="/favicons/submark-red.png"
        alt=""
        width={48}
        height={40}
        preload={preload}
        aria-hidden
        className="h-full w-auto shrink-0"
      />
      <div className="relative h-full min-w-0 flex-1">
        <Image
          src="/logos/wordmark-white.png"
          alt="DARUNITED"
          fill
          preload={preload}
          sizes="240px"
          className="object-contain object-left"
        />
      </div>
    </div>
  );
}

function ComingSoonBackground() {
  const {
    props: { srcSet: desktop },
  } = getImageProps({
    alt: "",
    fill: true,
    sizes: "100vw",
    preload: true,
    src: "/backgrounds/coming_soon_background.png",
  });

  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({
    alt: "",
    fill: true,
    sizes: "100vw",
    preload: true,
    src: "/backgrounds/coming_soon_background_phone.png",
  });

  return (
    <picture
      className="pointer-events-none absolute inset-0"
      aria-hidden
    >
      <source media="(min-width: 1024px)" srcSet={desktop} />
      <img
        {...rest}
        alt=""
        srcSet={mobile}
        className="h-full w-full object-cover object-top"
      />
    </picture>
  );
}

export function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-background lg:flex lg:items-start lg:justify-center">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-transparent text-foreground max-lg:min-h-[800px] lg:h-[1180px] lg:min-h-0 lg:max-w-[1920px]">
        <ComingSoonBackground />

        <header className="absolute inset-x-0 top-0 z-10 flex h-[56px] shrink-0 items-center justify-between bg-transparent px-[20px] lg:h-[96px] lg:px-[80px]">
          <ComingSoonLogo
            className="h-[16.5px] w-[100.3px] lg:h-[40px] lg:w-[279.6px]"
            preload
          />
          <a
            href="#"
            className="inline-flex items-center bg-transparent text-[8px] font-normal uppercase text-[var(--du-white)] transition-colors duration-150 hover:text-[var(--du-grey)] lg:h-[40px] lg:px-6 lg:text-[20px]"
          >
            Contact us
          </a>
        </header>

        <main className="relative z-10 flex flex-col px-[20px] pt-[173px] lg:px-[80px] lg:pt-[353px] lg:pb-[297px]">
          <p className="text-[19px] font-medium uppercase leading-none text-primary lg:text-[38px]">
            Built beyond steel
          </p>

          <h1 className="mt-[9px] font-heading text-[49px] font-medium uppercase leading-[49px] text-[color:var(--du-white)] lg:mt-[26px] lg:h-[170px] lg:text-[96px] lg:leading-[85px]">
            Coming
            <br />
            Soon
          </h1>

          <p className="mt-[21px] max-w-[320px] text-[11px] font-normal leading-[14px] text-foreground lg:mt-[26px] lg:max-w-[560px] lg:text-[24px] lg:leading-[32px]">
            Our site is under construction, but our facilities are fully
            operational. Contact us today for all metal and steel manufacturing
            inquiries.
          </p>

          <a
            href={`mailto:${INQUIRY_EMAIL}`}
            className="mt-[8px] inline-flex h-[28px] w-[83px] items-center justify-center bg-primary text-[10px] font-normal uppercase text-primary-foreground transition-opacity hover:opacity-90 lg:mt-[26px] lg:h-[48px] lg:w-[144px] lg:text-[18px] lg:font-medium"
          >
            Send inquiry
          </a>
        </main>

        <footer className="relative z-10 mt-auto flex h-[80px] shrink-0 items-center justify-between bg-background px-[20px] lg:mt-0 lg:h-[100px] lg:px-[80px]">
          <div className="flex flex-col justify-center gap-0.5 lg:gap-1">
            <ComingSoonLogo className="h-[16.5px] w-[100.3px] lg:h-[32px] lg:w-[195px]" />
            <p className="text-[8px] font-normal text-foreground lg:text-[12px]">
              ©2026 All rights reserved.
            </p>
          </div>

          <nav
            aria-label="Social media"
            className="flex items-center gap-3 lg:gap-5"
          >
            {SOCIAL_LINKS.map((link) => {
              const Icon = socialIcons[link.name];
              return (
                <a
                  key={link.name}
                  href={link.href}
                  aria-label={link.name}
                  className="text-primary transition-opacity hover:opacity-80"
                >
                  <Icon className="h-4 w-4 lg:h-6 lg:w-6" />
                </a>
              );
            })}
          </nav>
        </footer>
      </div>
    </div>
  );
}
