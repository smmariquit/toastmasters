// functions/clubs/[id]/members/[memberId].ts

// ponytail: see functions/clubs/[id].ts — same placeholder-shell approach.
type ShellContext = {
  request: Request;
  env: { ASSETS: { fetch: (input: string | URL) => Promise<Response> } };
};

export const onRequestGet = async (context: ShellContext) => {
  return context.env.ASSETS.fetch(new URL('/clubs/placeholder/members/placeholder', context.request.url));
};
