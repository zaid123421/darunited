export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8">{children}</div>
  );
}
