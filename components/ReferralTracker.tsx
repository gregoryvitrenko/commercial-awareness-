'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function ReferralTrackerInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && /^[0-9a-f]{8}$/.test(ref)) {
      // 30-day expiry, SameSite=Lax (follows cross-site links), path=/
      document.cookie = `folio-ref=${ref}; max-age=${30 * 24 * 3600}; path=/; SameSite=Lax`;
    }
  }, [searchParams]);

  return null;
}

/**
 * Invisible client component that reads the ?ref= query param and stores it
 * as a folio-ref cookie (30-day expiry). Wrapped in Suspense as required by
 * Next.js 15 for useSearchParams in client components.
 */
export function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <ReferralTrackerInner />
    </Suspense>
  );
}
