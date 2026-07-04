// functions/clubs/[id].ts

// ponytail: static export can only pre-render the one club id it knew about
// at build time ("placeholder"). Serve that shell for every real id — the
// client re-derives the actual id from the URL (src/lib/utils/route-params.ts).
type ShellContext = {
  request: Request;
  env: { ASSETS: { fetch: (input: string | URL) => Promise<Response> } };
};

export const onRequestGet = async (context: ShellContext) => {
  return context.env.ASSETS.fetch(new URL('/clubs/placeholder', context.request.url));
};
