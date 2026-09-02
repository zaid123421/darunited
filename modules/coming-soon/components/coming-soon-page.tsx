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
    <div className={cn("flex items-center gap-0 lg:gap-1.5", className)}>
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
        className="h-[calc(100%+50px)] w-full -translate-y-[50px] object-cover object-top"
      />
    </picture>
  );
}

export function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-transparent text-foreground max-lg:min-h-[750px]">
        <ComingSoonBackground />

        <header className="absolute inset-x-0 top-0 z-10 flex h-[56px] shrink-0 items-center justify-between bg-transparent px-[20px] lg:h-[96px] lg:px-[80px]">
          <ComingSoonLogo
            className="h-[19.5px] w-[119px] shrink-0 lg:h-[38px] lg:w-[231px]"
            preload
          />
          <a
            href="#"
            className="inline-flex shrink-0 items-center bg-transparent text-[9px] font-normal uppercase text-[var(--du-white)] transition-colors duration-150 hover:text-[var(--du-grey)] lg:text-[14px]"
          >
            Contact us
          </a>
        </header>

        <main className="relative z-10 flex flex-col px-[20px] pt-[160px] lg:px-[80px] lg:pt-[190px]">
          <p className="text-[19px] font-medium uppercase leading-none text-primary lg:text-[26px]">
            Built beyond steel
          </p>

          <h1 className="mt-[17px] font-heading text-[49px] font-medium uppercase leading-[49px] text-[color:var(--du-white)] lg:mt-[17px] lg:h-[117px] lg:text-[67px] lg:leading-[62px]">
            Coming
            <br />
            Soon
          </h1>

          <p className="mt-[17px] max-w-[320px] text-[11px] font-normal leading-[14px] text-foreground lg:mt-[17px] lg:max-w-[375px] lg:text-[16px] lg:leading-[22px]">
            Our site is under construction, but our facilities are fully
            operational. Contact us today for all metal and steel manufacturing
            inquiries.
          </p>

          <a
            href={`mailto:${INQUIRY_EMAIL}`}
            className="mt-[17px] inline-flex h-[28px] w-[83px] items-center justify-center bg-primary text-[10px] font-medium uppercase text-primary-foreground transition-opacity hover:opacity-90 lg:mt-[17px] lg:h-[33px] lg:w-[101px] lg:text-[12px]"
          >
            Send inquiry
          </a>
        </main>

        <footer className="relative z-10 mt-auto flex h-[80px] shrink-0 items-center justify-between bg-background px-[20px] lg:h-[100px] lg:px-[80px]">
          <div className="flex flex-col justify-center gap-0.5 lg:gap-1">
            <ComingSoonLogo className="h-[16.5px] w-[101px] lg:h-[26px] lg:w-[159px]" />
            <p className="text-[8px] font-normal text-foreground lg:text-[10px]">
              ©2026 All rights reserved.
            </p>
          </div>

          <nav
            aria-label="Social media"
            className="flex items-center gap-3 lg:gap-4"
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
                  <Icon
                    className={
                      link.name === "Instagram"
                        ? "h-4 w-4 shrink-0 lg:h-5 lg:w-5"
                        : "h-4 w-auto shrink-0 lg:h-5"
                    }
                  />
                </a>
              );
            })}
          </nav>
        </footer>
      </div>
    </div>
  );
}
