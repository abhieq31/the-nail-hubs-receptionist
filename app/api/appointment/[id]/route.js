import { NextResponse } from 'next/server';
import { getSupabase, NOT_CONFIGURED } from '@/lib/supabase';
import { isRateLimited } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  if (isRateLimited(request, { scope: 'appointment_lookup', limit: 20, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ detail: 'Too many attempts — please wait a few minutes and try again.' }, { status: 429 });
  }

  const { id } = await params;
  const confirmationId = (id || '').toUpperCase();

  if (!/^NH[A-F0-9]{6}$/.test(confirmationId)) {
    return NextResponse.json({ detail: 'Invalid confirmation ID' }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json(NOT_CONFIGURED.body, { status: NOT_CONFIGURED.status });

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('confirmation_id', confirmationId)
    .maybeSingle();

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ detail: 'Appointment not found' }, { status: 404 });
  return NextResponse.json(data);
}
