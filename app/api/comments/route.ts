import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getComments, addComment, deleteComment } from '@/lib/comments-server';
import { isSubscribed } from '@/lib/subscription';
import { isValidDate, isValidStoryId } from '@/lib/security';
import type { Comment } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const storyId = searchParams.get('storyId');

  if (!date || !storyId || !isValidDate(date) || !isValidStoryId(storyId)) {
    return NextResponse.json({ error: 'Invalid date or storyId' }, { status: 400 });
  }

  const comments = await getComments(date, storyId);
  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    console.warn('[comments] POST — unauthenticated request rejected');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscribed = await isSubscribed(userId);
  if (!subscribed) {
    return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { date, storyId, text } = body as { date?: string; storyId?: string; text?: string };

  if (!date || !storyId || !text?.trim() || !isValidDate(date) || !isValidStoryId(storyId)) {
    return NextResponse.json({ error: 'Invalid date, storyId, or text' }, { status: 400 });
  }

  if (text.trim().length > 500) {
    return NextResponse.json({ error: 'Comment exceeds 500 characters' }, { status: 400 });
  }

  const user = await currentUser();
  const first = user?.firstName ?? '';
  const last = user?.lastName ? user.lastName[0] + '.' : '';
  const userName =
    (first + ' ' + last).trim() ||
    user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
    'Anonymous';

  const comment: Comment = {
    id: crypto.randomUUID(),
    storyId,
    date,
    userId,
    userName,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  await addComment(comment);
  return NextResponse.json({ comment });
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    console.warn('[comments] DELETE — unauthenticated request rejected');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { date, storyId, commentId } = body as {
    date?: string;
    storyId?: string;
    commentId?: string;
  };

  if (!date || !storyId || !commentId || !isValidDate(date) || !isValidStoryId(storyId)) {
    return NextResponse.json({ error: 'Invalid date, storyId, or commentId' }, { status: 400 });
  }

  const result = await deleteComment(date, storyId, commentId, userId);

  if (result === 'not-found') {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }
  if (result === 'forbidden') {
    return NextResponse.json({ error: 'Cannot delete another user\'s comment' }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
