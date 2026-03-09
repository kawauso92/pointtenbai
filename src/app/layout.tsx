import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { appName } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: appName,
  description: "ポイ活・転売・回線案件を単一ユーザーで管理するためのダッシュボード",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}