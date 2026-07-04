// src/app/meetings/[id]/grammarian/page.tsx

import GrammarianClient from './GrammarianClient';

// ponytail: see src/app/clubs/[id]/page.tsx for why this is a placeholder.
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function MeetingGrammarianPage() {
  return <GrammarianClient />;
}
