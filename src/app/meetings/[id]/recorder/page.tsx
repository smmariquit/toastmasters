// src/app/meetings/[id]/recorder/page.tsx

import RecorderClient from './RecorderClient';

// ponytail: see src/app/clubs/[id]/page.tsx for why this is a placeholder.
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function SpeechRecorderPage() {
  return <RecorderClient />;
}
