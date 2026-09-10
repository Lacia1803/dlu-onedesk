import React, { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorSummaryProps {
  errors: Record<string, { message?: string } | undefined>;
}

export function ErrorSummary({ errors }: ErrorSummaryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const errorKeys = Object.keys(errors).filter((k) => errors[k]?.message);

  useEffect(() => {
    if (errorKeys.length > 0) {
      containerRef.current?.focus();
    }
  }, [errorKeys.length]);

  if (errorKeys.length === 0) return null;

  return (
    <div
      ref={containerRef}
      role="alert"
      tabIndex={-1}
      aria-labelledby="error-summary-title"
      className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-2 font-semibold" id="error-summary-title">
        <AlertCircle className="size-5 shrink-0" />
        <span>Vui lòng sửa các lỗi sau trước khi tiếp tục:</span>
      </div>
      <ul className="mt-2 list-disc pl-6 text-sm space-y-1">
        {errorKeys.map((key) => (
          <li key={key}>
            <a
              href={`#${key}`}
              className="underline underline-offset-2 hover:opacity-80 font-medium"
            >
              {errors[key]?.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
