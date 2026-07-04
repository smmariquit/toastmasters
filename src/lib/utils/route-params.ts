// src/lib/utils/route-params.ts

'use client';

import { useEffect, useState } from 'react';

/**
 * ponytail: output:'export' bakes generateStaticParams() values into the
 * one static shell every real (unknown-at-build-time) id gets served from
 * (see functions/clubs/[id].ts etc.), so useParams() would always read back
 * "placeholder". Read the real segment straight from the browser URL
 * instead — correct regardless of which static shell Cloudflare served.
 */
export function useRouteParam(position: number): string {
  const [value, setValue] = useState('');
  useEffect(() => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    setValue(segments[position] ?? '');
  }, [position]);
  return value;
}
