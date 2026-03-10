import type { PropsWithChildren, ReactNode } from "react";

type FieldProps = PropsWithChildren<{
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
  htmlFor?: string;
  endAdornment?: ReactNode;
}>;

export function Field({
  label,
  error,
  description,
  required,
  htmlFor,
  endAdornment,
  children,
}: FieldProps) {
  return (
    <label className="grid gap-1.5 text-[13px] md:gap-2 md:text-sm" htmlFor={htmlFor}>
      <span className="flex items-center justify-between gap-2.5">
        <span className="text-[13px] font-medium text-ink md:text-sm">
          {label}
          {required ? <span className="ml-1 text-prospect">*</span> : null}
        </span>
        {endAdornment}
      </span>
      {children}
      {description ? <span className="text-[11px] leading-tight text-ink-sub md:text-xs">{description}</span> : null}
      {error ? <span className="text-[11px] font-medium leading-tight text-red-600 md:text-xs">{error}</span> : null}
    </label>
  );
}
