// src/app/meetings/[id]/evaluation/page.tsx

import EvaluationClient from './EvaluationClient';

// ponytail: see src/app/clubs/[id]/page.tsx for why this is a placeholder.
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function MeetingEvaluationPage() {
  return <EvaluationClient />;
}
