"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { ThemeToggle } from "@/components/theme-provider";

type NavigationItem = {
  href: string;
  label: string;
  mobileLabel: string;
  icon: "home" | "point" | "resale" | "mobile" | "settings";
};

const navigationItems: NavigationItem[] = [
  { href: "/", label: "ダッシュボード", mobileLabel: "ホーム", icon: "home" },
  { href: "/point-activities", label: "ポイ活管理", mobileLabel: "ポイ活", icon: "point" },
  { href: "/resale", label: "転売管理", mobileLabel: "転売", icon: "resale" },
  { href: "/mobile-lines", label: "回線管理", mobileLabel: "回線", icon: "mobile" },
  { href: "/settings", label: "設定", mobileLabel: "設定", icon: "settings" },
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

function NavigationIcon({ icon, isActive }: { icon: NavigationItem["icon"]; isActive: boolean }) {
  const baseClassName = isActive ? "text-nav-active-text" : "text-ink-sub";

  switch (icon) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-[18px] w-[18px] md:h-5 md:w-5 ${baseClassName}`}>
          <path d="M3.75 10.5L12 4l8.25 6.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.75 9.75V20h10.5V9.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "point":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-[18px] w-[18px] md:h-5 md:w-5 ${baseClassName}`}>
          <path d="M12 3.75l2.45 4.96 5.47.8-3.96 3.86.94 5.46L12 16.24l-4.9 2.59.94-5.46-3.96-3.86 5.47-.8L12 3.75z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "resale":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-[18px] w-[18px] md:h-5 md:w-5 ${baseClassName}`}>
          <path d="M7 7.5h10a2 2 0 012 2v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 7.5V6a3 3 0 016 0v1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 12h5" strokeLinecap="round" />
        </svg>
      );
    case "mobile":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-[18px] w-[18px] md:h-5 md:w-5 ${baseClassName}`}>
          <rect x="7" y="3.5" width="10" height="17" rx="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.5 6.75h3" strokeLinecap="round" />
          <path d="M11.25 17.25h1.5" strokeLinecap="round" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-[18px] w-[18px] md:h-5 md:w-5 ${baseClassName}`}>
          <path d="M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.5 13.5v-3l2.08-.58a5.79 5.79 0 01.64-1.54L6.1 6.44l2.12-2.12 1.94 1.12c.49-.26 1-.48 1.54-.64L12.3 2.7h3l.58 2.08c.54.16 1.05.38 1.54.64l1.94-1.12 2.12 2.12-1.12 1.94c.26.49.48 1 .64 1.54l2.08.58v3l-2.08.58a5.79 5.79 0 01-.64 1.54l1.12 1.94-2.12 2.12-1.94-1.12a5.79 5.79 0 01-1.54.64l-.58 2.08h-3l-.58-2.08a5.79 5.79 0 01-1.54-.64l-1.94 1.12-2.12-2.12 1.12-1.94a5.79 5.79 0 01-.64-1.54L4.5 13.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3 pb-24 pt-2.5 md:px-6 md:py-6">
        <header className="mb-2.5 flex items-center justify-between gap-2.5 rounded-[20px] border border-border-theme bg-nav-surface px-3 py-2 shadow-panel backdrop-blur md:hidden">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">Pointtenbai</p>
            <h1 className="mt-0.5 truncate text-[15px] font-semibold leading-tight text-ink">利益管理アプリ</h1>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3 md:flex-row md:gap-6 lg:gap-8">
          <aside className="hidden top-6 h-fit shrink-0 rounded-[28px] border border-border-theme bg-nav-surface p-4 shadow-panel backdrop-blur md:sticky md:block md:w-64 lg:w-72">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Pointtenbai</p>
                <h1 className="mt-2 text-2xl font-semibold">利益管理アプリ</h1>
                <p className="mt-2 text-sm text-ink-sub">Supabase を前提にした単一ユーザー向け管理画面。</p>
              </div>
              <ThemeToggle />
            </div>

            <nav className="grid gap-2">
              {navigationItems.map((item) => {
                const isActive = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-nav-active text-nav-active-text shadow-sm"
                        : "bg-transparent text-ink-sub hover:bg-surface hover:text-ink"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 pb-1 md:pb-0">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border-theme bg-nav-surface/95 px-2 pt-1 shadow-[0_-12px_30px_rgba(0,0,0,0.18)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 pb-[calc(env(safe-area-inset-bottom)+0.45rem)]">
          {navigationItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[3.45rem] flex-col items-center justify-center gap-0.5 rounded-[18px] px-1.5 py-1 text-[10px] font-medium transition ${
                  isActive
                    ? "bg-nav-active text-nav-active-text shadow-sm"
                    : "text-ink-sub hover:bg-surface hover:text-ink"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <NavigationIcon icon={item.icon} isActive={isActive} />
                <span className="leading-none">{item.mobileLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
