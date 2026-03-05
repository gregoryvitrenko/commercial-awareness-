import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isSubscribed } from '@/lib/subscription';
import {
  getBookmarksForUser,
  addBookmarkForUser,
  removeBookmarkForUser,
} from '@/lib/bookmarks-server';
import { isValidDate, isValidStoryId } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

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

  // Rate limit: 60 bookmark adds per hour
  const limited = await checkRateLimit(userId, 'bookmarks-post', 60, 3600);
  if (limited) return limited;

  const body = await request.json().catch(() => null);

  // SECURITY FIX: validate expected fields explicitly — previously spread the entire
  // client-controlled object into storage, allowing arbitrary key injection.
  if (
    !body ||
    typeof body.storyId !== 'string' ||
    typeof body.date !== 'string' ||
    !isValidStoryId(body.storyId) ||
    !isValidDate(body.date)
  ) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  await addBookmarkForUser(userId, {
    storyId:   body.storyId,
    date:      body.date,
    headline:  typeof body.headline  === 'string' ? body.headline.slice(0, 300)  : '',
    topic:     typeof body.topic     === 'string' ? body.topic.slice(0, 50)      : '',
    excerpt:   typeof body.excerpt   === 'string' ? body.excerpt.slice(0, 500)   : '',
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
