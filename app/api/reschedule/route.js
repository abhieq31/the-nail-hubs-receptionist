import { NextResponse } from 'next/server';
import { validateSlot, fetchAppointmentsForDate } from '@/lib/availability';
import { getSupabase, NOT_CONFIGURED } from '@/lib/supabase';
import { isRateLimited } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (isRateLimited(request, { scope: 'reschedule', limit: 20, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ detail: 'Too many attempts — please wait a few minutes and try again.' }, { status: 429 });
  }

  const { confirmation_id, new_date, new_time } = await request.json();
  const confirmationId = (confirmation_id || '').toUpperCase();

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json(NOT_CONFIGURED.body, { status: NOT_CONFIGURED.status });

  try {
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('confirmation_id', confirmationId)
      .maybeSingle();

    if (fetchError) return NextResponse.json({ detail: fetchError.message }, { status: 500 });
    if (!appointment) return NextResponse.json({ detail: 'Appointment not found' }, { status: 404 });
    if (appointment.status !== 'confirmed') {
      return NextResponse.json({ detail: 'Appointment is not active' }, { status: 400 });
    }

    // Exclude this appointment itself so moving within its own window works
    const existing = await fetchAppointmentsForDate(supabase, new_date, confirmationId);
    const check = validateSlot(appointment.service, new_date, new_time, existing);
    if (!check.ok) {
      return NextResponse.json({ detail: check.error }, { status: 409 });
    }

    const { error: updateError } = await supabase
      .from('appointments')
      .update({ appointment_date: new_date, appointment_time: new_time, end_time: check.endTime })
      .eq('confirmation_id', confirmationId);

    if (updateError) {
      if (updateError.code === '23P01') {
        return NextResponse.json({ detail: 'This time slot was just booked by someone else' }, { status: 409 });
      }
      return NextResponse.json({ detail: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Appointment rescheduled',
      confirmation_id: confirmationId,
    });
  } catch (e) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
