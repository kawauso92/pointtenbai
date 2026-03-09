import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#122117",
        canvas: "#f5f2e9",
        accent: "#1d6f5f",
        accentSoft: "#d7efe8",
        sand: "#e9dfcf",
        warn: "#c46b31",
        calm: "#61758a"
      },
      boxShadow: {
        panel: "0 12px 32px rgba(18, 33, 23, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;