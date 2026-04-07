import { Alert } from './Alert';

export function LoadingPanel({ label = 'Loading...' }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500"
      role="status"
      aria-live="polite"
    >
      <div
        className="h-10 w-10 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"
        aria-hidden
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function FetchErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-lg mx-auto py-16 px-4" role="alert">
      <Alert variant="error" title="Could not load data">
        <p>{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-medium hover:bg-red-800 transition"
        >
          Try again
        </button>
      </Alert>
    </div>
  );
}

export function SectionFetchError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Alert variant="error" title="Could not load this section">
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 px-3 py-1.5 rounded-lg bg-red-700 text-white text-xs font-medium hover:bg-red-800 transition"
        >
          Retry
        </button>
      ) : null}
    </Alert>
  );
}
