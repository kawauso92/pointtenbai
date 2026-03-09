import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    className?: string;
  }
>;

const variantClassMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-accent text-white hover:opacity-90",
  secondary: "border border-border-theme bg-surface-alt text-ink hover:bg-surface",
  ghost: "bg-transparent text-ink-sub hover:bg-nav-active hover:text-ink",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClassMap[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
