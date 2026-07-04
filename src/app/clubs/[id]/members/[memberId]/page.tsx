// src/app/clubs/[id]/members/[memberId]/page.tsx

import MemberDetailClient from './MemberDetailClient';

// ponytail: see src/app/clubs/[id]/page.tsx for why this is a placeholder.
export function generateStaticParams() {
  return [{ id: 'placeholder', memberId: 'placeholder' }];
}

export default function MemberDetailPage() {
  return <MemberDetailClient />;
}
