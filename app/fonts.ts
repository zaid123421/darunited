import localFont from "next/font/local";

/**
 * Aktiv Grotesk — brand guide uses Regular, Medium, and Bold;
 * Light is included for subtle body copy on marketing pages.
 */
export const aktivGrotesk = localFont({
  src: [
    {
      path: "../public/fonts/Aktiv Grotesk/OTF/AktivGrotesk-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Aktiv Grotesk/OTF/AktivGrotesk-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Aktiv Grotesk/OTF/AktivGrotesk-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Aktiv Grotesk/OTF/AktivGrotesk-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-aktiv",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});
