import { auth } from '@clerk/nextjs/server';
import { isSubscribed } from '@/lib/subscription';
import { getEntries, addEntry, updateEntry, deleteEntry } from '@/lib/tracker';
import type { TrackerStatus } from '@/lib/types';

async function checkAuth(): Promise<{ userId: string } | Response> {
  if (process.env.PREVIEW_MODE === 'true') return { userId: 'preview-dev' };
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (userId === process.env.ADMIN_USER_ID) return { userId };
  const subscribed = await isSubscribed(userId);
  if (!subscribed) return Response.json({ error: 'Forbidden' }, { status: 403 });
  return { userId };
}

export async function GET(): Promise<Response> {
  const authResult = await checkAuth();
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  const entries = await getEntries(userId);
  const sorted = [...entries].sort((a, b) => a.deadline.localeCompare(b.deadline));
  return Response.json({ entries: sorted });
}

export async function POST(request: Request): Promise<Response> {
  const authResult = await checkAuth();
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  const body = await request.json();
  const { action } = body;

  if (action === 'add') {
    const { firm, status, deadline, notes } = body;
    if (!firm || !status || !deadline) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (typeof firm !== 'string' || firm.length > 100) {
      return Response.json({ error: 'Firm name too long' }, { status: 400 });
    }
    if (typeof notes === 'string' && notes.length > 500) {
      return Response.json({ error: 'Notes too long' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
      return Response.json({ error: 'Invalid deadline format' }, { status: 400 });
    }
    const now = new Date().toISOString();
    const entry = {
      id: crypto.randomUUID(),
      firm: firm.trim(),
      status: status as TrackerStatus,
      deadline,
      notes: (notes ?? '').trim(),
      createdAt: now,
      updatedAt: now,
    };
    const entries = await addEntry(userId, entry);
    const sorted = [...entries].sort((a, b) => a.deadline.localeCompare(b.deadline));
    return Response.json({ entries: sorted });
  }

  if (action === 'update') {
    const { id, status, notes } = body;
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
    const patch: Partial<{ status: TrackerStatus; notes: string }> = {};
    if (status !== undefined) patch.status = status as TrackerStatus;
    if (notes !== undefined) patch.notes = notes;
    const entries = await updateEntry(userId, id, patch);
    const sorted = [...entries].sort((a, b) => a.deadline.localeCompare(b.deadline));
    return Response.json({ entries: sorted });
  }

  if (action === 'delete') {
    const { id } = body;
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
    const entries = await deleteEntry(userId, id);
    const sorted = [...entries].sort((a, b) => a.deadline.localeCompare(b.deadline));
    return Response.json({ entries: sorted });
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
}
