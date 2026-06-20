import { NextResponse } from 'next/server';
import { getSupabase, NOT_CONFIGURED } from '@/lib/supabase';
import { isRateLimited } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (isRateLimited(request, { scope: 'cancel', limit: 20, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ detail: 'Too many attempts — please wait a few minutes and try again.' }, { status: 429 });
  }

  const { confirmation_id } = await request.json();
  const confirmationId = (confirmation_id || '').toUpperCase();

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json(NOT_CONFIGURED.body, { status: NOT_CONFIGURED.status });

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('confirmation_id', confirmationId)
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ detail: 'Appointment not found' }, { status: 404 });

  return NextResponse.json({ status: 'success', message: 'Appointment cancelled' });
}
