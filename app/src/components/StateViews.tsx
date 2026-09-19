export function LoadingView({ message = 'A carregar...' }: { message?: string }) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-pedeja-600" aria-label="A carregar" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 p-4 text-center">
      <p className="text-sm font-medium text-red-700 dark:text-red-300">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white active:scale-95">
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export function EmptyView({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 text-center shadow-sm">
      <p className="text-sm font-bold text-gray-900 dark:text-white">{title}</p>
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

export function BackendBlockedView({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 p-4 text-center">
      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Backend indisponível</p>
      <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{message}</p>
    </div>
  );
}
