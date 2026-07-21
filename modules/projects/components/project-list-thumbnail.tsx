import { cn } from "@/shared/lib/cn";

interface ProjectListThumbnailProps {
  imageUrl: string | null;
  title: string;
  className?: string;
}

export function ProjectListThumbnail({
  imageUrl,
  title,
  className,
}: ProjectListThumbnailProps) {
  const hasImage = Boolean(imageUrl);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border border-border bg-muted",
        className,
      )}
    >
      {hasImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
          role="img"
          aria-label={title}
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/35 via-accent/20 to-background"
          aria-hidden
        />
      )}
    </div>
  );
}
