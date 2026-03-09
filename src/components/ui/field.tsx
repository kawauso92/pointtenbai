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
    <label className="grid gap-2 text-sm" htmlFor={htmlFor}>
      <span className="flex items-center justify-between gap-3">
        <span className="font-medium text-ink/80">
          {label}
          {required ? <span className="ml-1 text-warn">*</span> : null}
        </span>
        {endAdornment}
      </span>
      {children}
      {description ? <span className="text-xs text-ink/55">{description}</span> : null}
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}