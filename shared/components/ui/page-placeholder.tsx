export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
      <h1 className="page-title">{title}</h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground sm:mt-6 sm:p-8">
        Module scaffold ready — connect API and UI here.
      </div>
    </div>
  );
}
