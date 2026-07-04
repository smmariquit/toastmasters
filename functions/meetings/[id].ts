// functions/meetings/[id].ts

// ponytail: see functions/clubs/[id].ts — same placeholder-shell approach.
// "/meetings/new" is a real static page and also matches this [id] pattern,
// so it needs to pass through untouched instead of getting the shell.
type ShellContext = {
  request: Request;
  params: { id: string };
  env: { ASSETS: { fetch: (input: string | URL) => Promise<Response> } };
};

export const onRequestGet = async (context: ShellContext) => {
  const target = context.params.id === 'new' ? '/meetings/new' : '/meetings/placeholder';
  return context.env.ASSETS.fetch(new URL(target, context.request.url));
};
