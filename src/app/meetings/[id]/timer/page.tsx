// src/app/meetings/[id]/timer/page.tsx

import TimerClient from './TimerClient';

// ponytail: see src/app/clubs/[id]/page.tsx for why this is a placeholder.
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function MeetingTimerPage() {
  return <TimerClient />;
}
