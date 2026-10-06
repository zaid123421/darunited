import { GoogleAnalytics } from "@next/third-parties/google";
import { env } from "@/shared/config/env";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
      {env.GA_MEASUREMENT_ID ? (
        <GoogleAnalytics gaId={env.GA_MEASUREMENT_ID} />
      ) : null}
    </div>
  );
}
