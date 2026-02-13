import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { appendRow } from '../_shared/google-sheets.ts';
import { mapToInteractionsRow } from '../_shared/schema.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const data = await req.json();

    const interactionRow = mapToInteractionsRow(data);
    await appendRow('Interactions', interactionRow);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    // Best effort — return 200 even on failure
    console.error('log-interaction error:', error);
    return new Response(
      JSON.stringify({ success: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
