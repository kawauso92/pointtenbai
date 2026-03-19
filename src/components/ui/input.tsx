import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-[18px] border border-border-theme bg-surface px-3 py-2 text-[13px] text-ink shadow-sm placeholder:text-ink-sub focus:border-accent focus:ring-2 focus:ring-accent/20 md:rounded-xl md:text-sm ${className}`}
      {...props}
    />
  );
}
