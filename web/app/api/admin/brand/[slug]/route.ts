import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { saveOverride, deleteOverride, type BrandOverrideUpdate } from '@/lib/brand-overrides';
import { revalidateTag, revalidatePath } from 'next/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAuth() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return null;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const { slug } = await ctx.params;
  let body: BrandOverrideUpdate;
  try {
    body = await req.json() as BrandOverrideUpdate;
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  try {
    const saved = await saveOverride(slug, body);
    revalidateTag('stock:all', 'max');
    revalidatePath(`/colores/${slug}`);
    return NextResponse.json({ ok: true, override: saved });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const { slug } = await ctx.params;
  try {
    await deleteOverride(slug);
    revalidatePath(`/colores/${slug}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
