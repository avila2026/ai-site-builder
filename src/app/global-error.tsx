'use client';

import GlobalErrorFallback from '@/components/GlobalErrorFallback';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <GlobalErrorFallback error={error} reset={reset} />;
}
