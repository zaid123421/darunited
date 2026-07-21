import Link from "next/link";
import { BrandMark } from "@/shared/components/brand/brand-mark";

const footerLinks = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="surface-footer mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <BrandMark href="/" mark="full" surface="on-red" size="md" />
            </div>
            <p className="max-w-xs text-sm font-medium leading-relaxed text-white">
              Building connected experiences for brands and communities.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, items]) => (
            <div key={title}>
              <h3 className="footer-title mb-3 text-xs uppercase tracking-wider text-white">
                {title}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/85 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/25 pt-6 sm:flex-row">
          <p className="text-xs text-white/80">
            © {new Date().getFullYear()} DARUNITED. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-white/80">Official platform</p>
            <Link
              href="/login"
              className="text-xs text-white/70 transition-colors hover:text-white"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
