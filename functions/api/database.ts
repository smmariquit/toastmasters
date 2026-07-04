// functions/api/database.ts

type KVNamespace = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
  delete: (key: string) => Promise<void>;
};

type DatabaseContext = {
  env: {
    TOASTMASTERS_KV: KVNamespace;
  };
  request: Request;
};

const DB_KEY = 'toastmasters-database';

export const onRequestGet = async (context: DatabaseContext) => {
  try {
    const raw = await context.env.TOASTMASTERS_KV.get(DB_KEY);

    if (!raw) {
      return Response.json({ exists: false, data: null });
    }

    return Response.json({ exists: true, data: JSON.parse(raw) });
  } catch (error) {
    console.error('Error fetching database:', error);
    // If KV is not configured, return null (will use localStorage fallback)
    return Response.json({ exists: false, data: null, error: 'KV not configured' });
  }
};

export const onRequestPost = async (context: DatabaseContext) => {
  try {
    const data = await context.request.json();

    await context.env.TOASTMASTERS_KV.put(DB_KEY, JSON.stringify(data));

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error saving database:', error);
    return Response.json({ success: false, error: 'Failed to save database' }, { status: 500 });
  }
};

export const onRequestDelete = async (context: DatabaseContext) => {
  try {
    await context.env.TOASTMASTERS_KV.delete(DB_KEY);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting database:', error);
    return Response.json({ success: false, error: 'Failed to delete database' }, { status: 500 });
  }
};
