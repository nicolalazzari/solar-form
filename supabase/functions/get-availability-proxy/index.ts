import { corsHeaders, handleCors } from '../_shared/cors.ts';

const MVF_API_URL = 'https://sejpbjqjfxmehyvlweil.supabase.co/functions/v1';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const postcode = url.searchParams.get('postcode')?.trim?.();
    if (!postcode) {
      return new Response(
        JSON.stringify({ error: 'postcode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const apiKey = Deno.env.get('PROJECT_SOLAR_MVF_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'PROJECT_SOLAR_MVF_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const mvfUrl = `${MVF_API_URL}/get-availability?postcode=${encodeURIComponent(postcode)}`;
    const proxyRes = await fetch(mvfUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    });

    const data = await proxyRes.text();
    return new Response(data, {
      status: proxyRes.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
