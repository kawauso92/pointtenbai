import type { TextareaHTMLAttributes } from "react";

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`min-h-28 w-full rounded-2xl px-3 py-2.5 text-sm shadow-sm ${className}`} {...props} />;
}