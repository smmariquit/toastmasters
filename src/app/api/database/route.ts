// src/app/api/database/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const DB_KEY = 'toastmasters-database';

// Get the database
export async function GET() {
  try {
    const data = await kv.get(DB_KEY);
    
    if (!data) {
      return NextResponse.json({ exists: false, data: null });
    }

    return NextResponse.json({ exists: true, data });
  } catch (error) {
    console.error('Error fetching database:', error);
    // If KV is not configured, return null (will use localStorage fallback)
    return NextResponse.json({ exists: false, data: null, error: 'KV not configured' });
  }
}

// Save the database
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    await kv.set(DB_KEY, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving database:', error);
    return NextResponse.json({ success: false, error: 'Failed to save database' }, { status: 500 });
  }
}

// Reset/Delete the database
export async function DELETE() {
  try {
    await kv.del(DB_KEY);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting database:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete database' }, { status: 500 });
  }
}
