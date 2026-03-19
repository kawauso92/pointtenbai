"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { navigationItems } from "@/components/navigation-items";
import { ThemeToggle } from "@/components/theme-provider";

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1360px] flex-col gap-3 px-3 py-3 md:px-4 md:py-4 lg:flex-row lg:gap-5">
        <header className="flex items-center justify-between gap-2.5 rounded-[20px] border border-border-theme bg-nav-surface px-3 py-2 shadow-panel backdrop-blur md:hidden">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">Pointtenbai</p>
            <h1 className="mt-0.5 truncate text-[15px] font-semibold leading-tight text-ink">利益管理アプリ</h1>
          </div>
          <ThemeToggle />
        </header>

        <aside className="top-4 hidden h-fit shrink-0 rounded-[24px] border border-border-theme bg-nav-surface p-3.5 shadow-panel backdrop-blur md:block lg:sticky lg:w-64">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">Pointtenbai</p>
              <h1 className="mt-1.5 text-xl font-semibold tracking-tight">利益管理アプリ</h1>
              <p className="mt-1.5 text-[13px] leading-5 text-ink-sub">ポイ活・転売・回線の実績をまとめて管理します。</p>
            </div>
            <ThemeToggle />
          </div>

          <nav className="grid gap-1.5">
            {navigationItems.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition ${
                    isActive
                      ? "bg-nav-active text-nav-active-text shadow-sm"
                      : "bg-transparent text-ink-sub hover:bg-surface hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
