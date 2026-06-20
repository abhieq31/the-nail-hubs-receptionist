import { NextResponse } from 'next/server';
import { SERVICES } from '@/lib/businessRules';
import {
  validateSlot,
  fetchAppointmentsForDate,
  generateConfirmationId,
} from '@/lib/availability';
import { getSupabase, NOT_CONFIGURED } from '@/lib/supabase';
import { isRateLimited } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (isRateLimited(request, { scope: 'book', limit: 5, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { detail: 'Too many booking attempts — please wait a few minutes and try again, or book on WhatsApp.' },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { customer_name, customer_phone, service, appointment_date, appointment_time } = body;

  const name = (customer_name || '').trim();
  const phone = (customer_phone || '').replace(/\D/g, '');
  if (name.length < 2 || name.length > 50) {
    return NextResponse.json({ detail: 'Please provide your full name' }, { status: 400 });
  }
  if (phone.length !== 10) {
    return NextResponse.json({ detail: 'Phone number must be exactly 10 digits' }, { status: 400 });
  }
  if (!SERVICES[service]) {
    return NextResponse.json({ detail: 'Invalid service' }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json(NOT_CONFIGURED.body, { status: NOT_CONFIGURED.status });

  try {
    const existing = await fetchAppointmentsForDate(supabase, appointment_date);
    const check = validateSlot(service, appointment_date, appointment_time, existing);
    if (!check.ok) {
      return NextResponse.json({ detail: check.error }, { status: 409 });
    }

    const appointment = {
      confirmation_id: generateConfirmationId(),
      customer_name: name,
      customer_phone: phone,
      service,
      service_duration: SERVICES[service].duration,
      appointment_date,
      appointment_time,
      end_time: check.endTime,
      status: 'confirmed',
      source: 'website',
    };

    const { data, error } = await supabase.from('appointments').insert(appointment).select().single();

    if (error) {
      // 23P01 = exclusion constraint: someone booked the same window concurrently
      if (error.code === '23P01') {
        return NextResponse.json({ detail: 'This time slot was just booked by someone else' }, { status: 409 });
      }
      // 23505 = duplicate confirmation id (vanishingly rare) — ask to retry
      if (error.code === '23505') {
        return NextResponse.json({ detail: 'Please try again' }, { status: 500 });
      }
      return NextResponse.json({ detail: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'success', appointment: data });
  } catch (e) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
