import { corsHeaders, handleCors } from '../_shared/cors.ts';

/**
 * Generate available appointment slots for the next 5 weekdays.
 * Time slots: 10:00, 14:00, 18:00 (90-minute appointments).
 *
 * TODO: Replace with real Project Solar API call when available.
 */
function generateAvailableSlots(postcode: string) {
  const slots: Array<{
    datetime: string;
    displayDate: string;
    displayTime: string;
    dayOfWeek: string;
  }> = [];

  const now = new Date();
  let daysAdded = 0;
  let dayOffset = 1;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  while (daysAdded < 5) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      dayOffset++;
      continue;
    }

    for (const hour of [10, 14, 18]) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);

      const day = slotDate.getDate();
      const month = monthNames[slotDate.getMonth()];
      const year = slotDate.getFullYear();

      slots.push({
        datetime: slotDate.toISOString(),
        displayDate: `${day} ${month} ${year}`,
        displayTime: `${String(hour).padStart(2, '0')}:00`,
        dayOfWeek: dayNames[slotDate.getDay()],
      });
    }

    daysAdded++;
    dayOffset++;
  }

  return slots;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { postcode } = await req.json();

    if (!postcode) {
      return new Response(
        JSON.stringify({ error: 'Postcode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const slots = generateAvailableSlots(postcode);

    // Group by date for convenience
    const slotsByDate: Record<string, typeof slots> = {};
    for (const slot of slots) {
      if (!slotsByDate[slot.displayDate]) {
        slotsByDate[slot.displayDate] = [];
      }
      slotsByDate[slot.displayDate].push(slot);
    }

    return new Response(
      JSON.stringify({ slots, slotsByDate, totalSlots: slots.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
