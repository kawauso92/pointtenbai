"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationIconKey } from "@/components/navigation-items";
import { navigationItems } from "@/components/navigation-items";

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

function NavIcon({ icon }: { icon: NavigationIconKey }) {
  const commonProps = {
    className: "h-[18px] w-[18px]",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };

  switch (icon) {
    case "dashboard":
      return (
        <svg aria-hidden="true" {...commonProps}>
          <path d="M4 5.5h7v5.5H4z" />
          <path d="M13 5.5h7v8.5h-7z" />
          <path d="M4 13h7v5.5H4z" />
          <path d="M13 16h7v2.5h-7z" />
        </svg>
      );
    case "point":
      return (
        <svg aria-hidden="true" {...commonProps}>
          <path d="M12 3.5 14.7 9H20l-4.2 3.8 1.2 5.7L12 15.4 7 18.5l1.2-5.7L4 9h5.3z" />
        </svg>
      );
    case "resale":
      return (
        <svg aria-hidden="true" {...commonProps}>
          <path d="M7 7h10" />
          <path d="M7 12h10" />
          <path d="M7 17h6" />
          <path d="m16.5 15.5 3 1.5-3 1.5" />
          <path d="M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5Z" />
        </svg>
      );
    case "mobile":
      return (
        <svg aria-hidden="true" {...commonProps}>
          <rect x="7" y="3.5" width="10" height="17" rx="2.5" />
          <path d="M10.5 6.5h3" />
          <path d="M11.7 17.5h.6" />
        </svg>
      );
    case "settings":
      return (
        <svg aria-hidden="true" {...commonProps}>
          <path d="M12 8.8a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4Z" />
          <path d="M4.8 13.1 3.8 12l1-1.1 1-.2a6.9 6.9 0 0 1 .7-1.6L6 8l.6-1.4 1.3.1c.4-.5.9-.9 1.4-1.2l.2-1.3h1.9l.2 1.3c.5.3 1 .7 1.4 1.2l1.3-.1.6 1.4-.5 1.1c.3.5.5 1 .7 1.6l1 .2 1 1.1-1 1.1-1 .2a6.9 6.9 0 0 1-.7 1.6l.5 1.1-.6 1.4-1.3-.1c-.4.5-.9.9-1.4 1.2l-.2 1.3H9.5l-.2-1.3c-.5-.3-1-.7-1.4-1.2l-1.3.1-.6-1.4.5-1.1a6.9 6.9 0 0 1-.7-1.6z" />
        </svg>
      );
  }
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="mx-auto max-w-[1360px] px-3 pb-[calc(env(safe-area-inset-bottom)+0.7rem)]">
        <nav className="grid grid-cols-5 gap-1 rounded-[20px] border border-border-theme bg-nav-surface/95 p-1.5 shadow-panel backdrop-blur">
          {navigationItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[16px] px-1 py-2 text-[11px] font-medium transition ${
                  isActive
                    ? "bg-nav-active text-nav-active-text shadow-sm"
                    : "text-ink-sub hover:bg-surface hover:text-ink"
                }`}
              >
                <NavIcon icon={item.icon} />
                <span>{item.shortLabel}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
