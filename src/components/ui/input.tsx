import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`w-full rounded-2xl px-3 py-2.5 text-sm shadow-sm ${className}`} {...props} />;
}