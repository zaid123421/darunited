"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Folder,
  FolderTree,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Phone,
  User,
  X,
} from "lucide-react";
import { BrandMark } from "@/shared/components/brand/brand-mark";
import { cn } from "@/shared/lib/cn";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";

type NavSubItem = {
  href: string;
  label: string;
};

type NavExpandableItem = {
  type: "expandable";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: NavSubItem[];
};

type NavLinkItem = {
  type: "link";
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

type NavSection = {
  label?: string;
  items: Array<NavExpandableItem | NavLinkItem>;
};

const dashboardItem: NavLinkItem = {
  type: "link",
  href: "/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard,
};

const navSections: NavSection[] = [
  {
    label: "Website Content",
    items: [
      {
        type: "expandable",
        label: "Projects",
        icon: Folder,
        defaultOpen: false,
        children: [
          { href: "/dashboard/projects", label: "All Projects" },
          { href: "/dashboard/projects/add", label: "Add Project" },
        ],
      },
      {
        type: "expandable",
        label: "Categories",
        icon: Layers,
        defaultOpen: false,
        children: [
          { href: "/dashboard/categories", label: "All Categories" },
          { href: "/dashboard/categories/add", label: "Add Category" },
        ],
      },
      {
        type: "expandable",
        label: "Subcategories",
        icon: FolderTree,
        defaultOpen: false,
        children: [
          { href: "/dashboard/subcategories", label: "All Subcategories" },
          { href: "/dashboard/subcategories/add", label: "Add Subcategory" },
        ],
      },
      {
        type: "expandable",
        label: "Products",
        icon: Package,
        defaultOpen: false,
        children: [
          { href: "/dashboard/products", label: "All Products" },
          { href: "/dashboard/products/add", label: "Add Product" },
        ],
      },
      {
        type: "link",
        href: "/dashboard/about",
        label: "About Us",
        icon: User,
      },
      {
        type: "link",
        href: "/dashboard/contact",
        label: "Contact Info",
        icon: Phone,
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        type: "link",
        href: "/dashboard/messages",
        label: "Messages",
        icon: MessageSquare,
      },
    ],
  },
];

function isPathActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isExpandableActive(pathname: string, children: NavSubItem[]) {
  return children.some((child) => isPathActive(pathname, child.href));
}

type SidebarProps = {
  open?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
};

export function Sidebar({ open = true, onNavigate, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { canWrite } = usePermissions();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};

      for (const section of navSections) {
        for (const item of section.items) {
          if (item.type === "expandable") {
            initial[item.label] =
              item.defaultOpen ?? isExpandableActive(pathname, item.children);
          }
        }
      }

      return initial;
    },
  );

  const visibleSections = navSections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.type !== "expandable" || canWrite) {
        return item;
      }

      return {
        ...item,
        children: item.children.filter(
          (child) => !child.href.endsWith("/add"),
        ),
      };
    }),
  }));

  useEffect(() => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (
          item.type === "expandable" &&
          isExpandableActive(pathname, item.children)
        ) {
          setExpandedGroups((current) =>
            current[item.label]
              ? current
              : { ...current, [item.label]: true },
          );
        }
      }
    }
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((current) => ({
      ...current,
      [label]: !current[label],
    }));
  };

  const dashboardActive = isPathActive(pathname, dashboardItem.href);
  const DashboardIcon = dashboardItem.icon;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] flex-col bg-card transition-transform duration-200",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex items-center justify-between px-5 py-5">
        <BrandMark href="/dashboard" mark="full" surface="on-dark" size="sm" />

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mx-5 border-t border-border" />

      <nav className="app-scrollbar flex-1 overflow-y-auto px-5 py-4">
        <ul className="mb-6">
          <li>
            <Link
              href={dashboardItem.href}
              onClick={onNavigate}
              className={cn(
                "cursor-pointer flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                dashboardActive
                  ? "bg-muted text-white"
                  : "text-white/80 hover:bg-muted/60 hover:text-white",
              )}
            >
              <DashboardIcon
                className={cn(
                  "h-4 w-4 shrink-0",
                  dashboardActive ? "text-primary" : "text-muted-foreground",
                )}
              />
              {dashboardItem.label}
            </Link>
          </li>
        </ul>

        {visibleSections.map((section) => (
          <div key={section.label} className="mb-6">
            {section.label ? (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
                {section.label}
              </p>
            ) : null}

            <ul className="space-y-1">
              {section.items.map((item) => {
                if (item.type === "link") {
                  const Icon = item.icon;
                  const isActive = isPathActive(pathname, item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-muted text-white"
                            : "text-white/80 hover:bg-muted/60 hover:text-white",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge ? (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-primary bg-background px-1.5 text-[10px] font-bold text-primary">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                }

                const Icon = item.icon;
                const isOpen = expandedGroups[item.label] ?? false;
                const groupActive = isExpandableActive(pathname, item.children);

                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.label)}
                      className={cn(
                        "cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        groupActive
                          ? "text-white"
                          : "text-white/80 hover:bg-muted/60 hover:text-white",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          groupActive ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-300 ease-in-out",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <ul className="overflow-hidden space-y-0.5 pl-10">
                        <div className="pt-1 pb-1">
                          {item.children.map((child) => {
                            const isActive = isPathActive(pathname, child.href);

                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onNavigate}
                                  className={cn(
                                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                                    isActive
                                      ? "font-medium text-white"
                                      : "text-muted-foreground hover:text-white",
                                  )}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </div>
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-5 pb-5">
        <div className="mb-4 border-t border-border" />

        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            logout.mutate();
          }}
          className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {logout.isPending ? "Signing out…" : "Logout"}
        </button>

        <p className="mt-4 px-3 text-[11px] text-muted-foreground/40">
          © {new Date().getFullYear()} DARUNITED
        </p>
      </div>
    </aside>
  );
}
