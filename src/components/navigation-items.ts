export type NavigationIconKey = "dashboard" | "point" | "resale" | "mobile" | "settings";

export type NavigationItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: NavigationIconKey;
};

export const navigationItems: NavigationItem[] = [
  { href: "/", label: "ダッシュボード", shortLabel: "ダッシュ", icon: "dashboard" },
  { href: "/point-activities", label: "ポイ活管理", shortLabel: "ポイ活", icon: "point" },
  { href: "/resale", label: "転売管理", shortLabel: "転売", icon: "resale" },
  { href: "/mobile-lines", label: "回線管理", shortLabel: "回線", icon: "mobile" },
  { href: "/settings", label: "設定", shortLabel: "設定", icon: "settings" },
];
