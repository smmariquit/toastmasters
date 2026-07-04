// functions/meetings/[id]/ah-counter.ts

// ponytail: see functions/clubs/[id].ts — same placeholder-shell approach.
type ShellContext = {
  request: Request;
  env: { ASSETS: { fetch: (input: string | URL) => Promise<Response> } };
};

export const onRequestGet = async (context: ShellContext) => {
  return context.env.ASSETS.fetch(new URL('/meetings/placeholder/ah-counter', context.request.url));
};
