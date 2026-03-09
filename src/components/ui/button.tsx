import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    className?: string;
  }
>;

const variantClassMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-accent text-white hover:bg-accent/90",
  secondary: "bg-sand text-ink hover:bg-sand/80",
  ghost: "bg-transparent text-ink/70 hover:bg-black/5",
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