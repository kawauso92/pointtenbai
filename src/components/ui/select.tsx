import type { SelectHTMLAttributes } from "react";

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`w-full rounded-2xl px-3 py-2.5 text-sm shadow-sm ${className}`} {...props} />;
}