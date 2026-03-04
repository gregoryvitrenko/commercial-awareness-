import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isSubscribed } from '@/lib/subscription';
import {
  getBookmarksForUser,
  addBookmarkForUser,
  removeBookmarkForUser,
} from '@/lib/bookmarks-server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ids: [], bookmarks: [] });

  const bookmarks = await getBookmarksForUser(userId);
  const ids = bookmarks.map((b) => `${b.date}-${b.storyId}`);
  return NextResponse.json({ ids, bookmarks });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    console.warn('[bookmarks] POST — unauthenticated request rejected');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Bookmarks are a premium feature — enforce subscription
  const subscribed = await isSubscribed(userId);
  if (!subscribed) {
    return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
  }

  const bookmark = await request.json().catch(() => null);
  if (!bookmark) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  await addBookmarkForUser(userId, {
    ...bookmark,
    savedAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    console.warn('[bookmarks] DELETE — unauthenticated request rejected');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.date !== 'string' || typeof body.storyId !== 'string') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { date, storyId } = body;
  await removeBookmarkForUser(userId, date, storyId);
  return NextResponse.json({ ok: true });
}
