import Image from "next/image";
import Link from "next/link";
import {
  resolveBrandSrc,
  type BrandMarkKind,
  type BrandSurface,
} from "@/shared/lib/brand-assets";
import { cn } from "@/shared/lib/cn";

type BrandMarkProps = {
  href?: string | null;
  className?: string;
  /** full = logo+wordmark, wordmark = text only, submark = icon mark */
  mark?: BrandMarkKind;
  /** Background context from brand guide */
  surface?: BrandSurface;
  size?: "sm" | "md" | "lg" | "xl";
  priority?: boolean;
};

const sizeClasses: Record<NonNullable<BrandMarkProps["size"]>, string> = {
  sm: "h-8 w-auto",
  md: "h-9 w-auto",
  lg: "h-14 w-auto sm:h-16",
  xl: "h-20 w-auto sm:h-24",
};

const sizePixels: Record<
  NonNullable<BrandMarkProps["size"]>,
  { width: number; height: number }
> = {
  sm: { width: 140, height: 32 },
  md: { width: 160, height: 36 },
  lg: { width: 220, height: 64 },
  xl: { width: 280, height: 96 },
};

export function BrandMark({
  href = "/",
  className,
  mark = "full",
  surface = "on-dark",
  size = "md",
  priority = false,
}: BrandMarkProps) {
  const src = resolveBrandSrc(mark, surface);
  const dims = sizePixels[size];

  const image = (
    <Image
      src={src}
      alt="DARUNITED"
      width={dims.width}
      height={dims.height}
      priority={priority}
      className={cn(
        "object-contain object-left",
        mark === "submark" && "aspect-square object-center",
        sizeClasses[size],
        className,
      )}
    />
  );

  if (!href) {
    return image;
  }

  return (
    <Link href={href} className="group inline-flex items-center">
      {image}
    </Link>
  );
}
