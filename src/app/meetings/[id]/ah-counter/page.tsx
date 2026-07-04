// src/app/meetings/[id]/ah-counter/page.tsx

import AhCounterClient from './AhCounterClient';

// ponytail: see src/app/clubs/[id]/page.tsx for why this is a placeholder.
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function MeetingAhCounterPage() {
  return <AhCounterClient />;
}
