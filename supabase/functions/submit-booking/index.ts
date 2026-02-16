import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { appendRow } from '../_shared/google-sheets.ts';
import { mapToSheet1Row } from '../_shared/schema.ts';

function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  return `PS-${year}-${random}`;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const data = await req.json();

    // Generate booking reference for confirmed bookings
    let bookingReference = '';
    if (data.action === 'booking_confirmed') {
      bookingReference = generateBookingReference();
    }

    console.log('[DEBUG] submit-booking:', {
      action: data.action,
      generatedRef: bookingReference,
      receivedBookingId: data.bookingId,
      receivedBookingReference: data.bookingReference,
    });

    const row = mapToSheet1Row({
      ...data,
      bookingReference: bookingReference || data.bookingReference || '',
      leadStatus: data.leadStatus || data.journeyStatus || '',
    });

    await appendRow('Sheet1', row);

    return new Response(
      JSON.stringify({ bookingReference, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('submit-booking error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
