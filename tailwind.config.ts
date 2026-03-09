import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0c1222",
          surface: "#131b2e",
          surfaceAlt: "#1a2540",
          nav: "#0a0f1c",
        },
        light: {
          bg: "#f5f7fa",
          surface: "#ffffff",
          nav: "#eef0f5",
        },
        accent: "var(--color-accent)",
        "accent-bg": "var(--color-accent-bg)",
        profit: "var(--color-profit)",
        "profit-bg": "var(--color-profit-bg)",
        prospect: "var(--color-prospect)",
        "prospect-bg": "var(--color-prospect-bg)",
        muted: "var(--color-muted)",
        "muted-bg": "var(--color-muted-bg)",
        ink: "var(--color-text)",
        "ink-sub": "var(--color-text-sub)",
        canvas: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-alt": "var(--color-surface-alt)",
        "nav-surface": "var(--color-nav)",
        "nav-active": "var(--color-nav-active)",
        "nav-active-text": "var(--color-nav-active-text)",
        "border-theme": "var(--color-border)",
      },
      boxShadow: {
        panel: "0 12px 32px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
