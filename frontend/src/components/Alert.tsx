import type { ReactNode } from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const VARIANT_STYLES: Record<
  AlertVariant,
  { container: string; title: string }
> = {
  info: {
    container: 'border-sky-200 bg-sky-50 text-sky-900',
    title: 'text-sky-900',
  },
  success: {
    container: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    title: 'text-emerald-900',
  },
  warning: {
    container: 'border-amber-200 bg-amber-50 text-amber-900',
    title: 'text-amber-900',
  },
  error: {
    container: 'border-red-200 bg-red-50 text-red-700',
    title: 'text-red-800',
  },
};

export function Alert({
  variant = 'info',
  title,
  children,
  className = '',
}: {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const styles = VARIANT_STYLES[variant];
  return (
    <div className={`rounded-xl border p-4 text-sm ${styles.container} ${className}`}>
      {title ? <div className={`font-medium mb-1 ${styles.title}`}>{title}</div> : null}
      <div>{children}</div>
    </div>
  );
}

