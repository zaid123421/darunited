import type { Metadata } from "next";
import { ComingSoonPage } from "@/modules/coming-soon/components/coming-soon-page";

export const metadata: Metadata = {
  title: "Coming Soon",
  description:
    "DARUNITED — our site is under construction, but our facilities are fully operational.",
};

export default function HomePage() {
  return <ComingSoonPage />;
}
