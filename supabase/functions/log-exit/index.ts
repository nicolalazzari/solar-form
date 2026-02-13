import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { appendRow } from '../_shared/google-sheets.ts';
import { mapToSheet1Row, mapToInteractionsRow } from '../_shared/schema.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const data = await req.json();

    const sheet1Row = mapToSheet1Row({
      ...data,
      action: data.exitReason || data.action || '',
      leadStatus: data.journeyStatus || 'abandoned',
    });

    const interactionRow = mapToInteractionsRow({
      ...data,
      action: data.exitReason || data.action || '',
    });

    // Write to both tabs in parallel
    await Promise.all([
      appendRow('Sheet1', sheet1Row),
      appendRow('Interactions', interactionRow),
    ]);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    // Best effort — return 200 even on failure so the browser
    // doesn't retry keepalive requests
    console.error('log-exit error:', error);
    return new Response(
      JSON.stringify({ success: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
