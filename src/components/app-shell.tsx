"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { ThemeToggle } from "@/components/theme-provider";

const navigationItems = [
  { href: "/", label: "ダッシュボード" },
  { href: "/point-activities", label: "ポイ活管理" },
  { href: "/resale", label: "転売管理" },
  { href: "/mobile-lines", label: "回線管理" },
  { href: "/settings", label: "設定" },
];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-4 md:px-6 md:py-6 lg:flex-row lg:gap-8">
        <aside className="top-6 h-fit shrink-0 rounded-[28px] border border-border-theme bg-nav-surface p-4 shadow-panel backdrop-blur lg:sticky lg:w-72">
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
              const isActive = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
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

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
