// src/app/clubs/[id]/page.tsx

import ClubDetailClient from './ClubDetailClient';

// ponytail: output:'export' requires every dynamic segment to be enumerated
// at build time. Club ids are created at runtime (stored in KV), so we
// can't know them ahead of time — emit one placeholder shell and let the
// client read the real id from the URL (see route-params.ts).
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function ClubDetailPage() {
  return <ClubDetailClient />;
}
