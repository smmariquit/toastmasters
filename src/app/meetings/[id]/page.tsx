// src/app/meetings/[id]/page.tsx

import MeetingDetailClient from './MeetingDetailClient';

// ponytail: see src/app/clubs/[id]/page.tsx for why this is a placeholder.
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function MeetingDetailPage() {
  return <MeetingDetailClient />;
}
