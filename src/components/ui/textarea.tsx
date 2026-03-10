import type { TextareaHTMLAttributes } from "react";

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-24 w-full rounded-[18px] border border-border-theme bg-surface px-3 py-2 text-[13px] text-ink shadow-sm placeholder:text-ink-sub focus:border-accent focus:ring-2 focus:ring-accent/20 md:min-h-28 md:rounded-2xl md:py-2.5 md:text-sm ${className}`}
      {...props}
    />
  );
}
