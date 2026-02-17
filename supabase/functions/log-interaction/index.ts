import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { appendRow } from '../_shared/google-sheets.ts';
import { mapToInteractionsRow } from '../_shared/schema.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const data = await req.json();

    // Build clean data object for interaction logging
    const enrichedData = {
      // Contact info
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      emailAddress: data.emailAddress || '',
      phoneNumber: data.phoneNumber || '',
      postcode: data.postcode || '',
      fullAddress: data.fullAddress || '',
      // Session tracking
      sessionId: data.sessionId || '',
      submissionId: data.submissionId || '',
      currentPage: data.currentPage || '',
      journeyStatus: data.journeyStatus || '',
      lastAction: data.lastAction || '',
      lastActionPage: data.lastActionPage || '',
      journeyStartTime: data.journeyStartTime || '',
      pageEnteredAt: data.pageEnteredAt || '',
      timeOnPage: data.timeOnPage,
      action: data.action || '',
      actionTimestamp: data.actionTimestamp || '',
      // Solar assessment data
      solarRoofArea: data.solarRoofArea,
      sunExposureHours: data.sunExposureHours,
      roofSpaceOver10m2: data.roofSpaceOver10m2,
      totalPanelCount: data.totalPanelCount,
      totalEstimatedEnergy: data.totalEstimatedEnergy,
      estimatedAnnualSavings: data.estimatedAnnualSavings,
      imageryQuality: data.imageryQuality || '',
      imageryDate: data.imageryDate || '',
      carbonOffset: data.carbonOffset,
      selectedSegmentsCount: data.selectedSegmentsCount,
      // Eligibility data
      isOver75: data.isOver75,
      ageOver75: data.ageOver75 || '',
      roofWorksPlanned: data.roofWorksPlanned,
      roofWorks: data.roofWorks || '',
      incomeOver15k: data.incomeOver15k,
      income: data.income || '',
      likelyToPassCreditCheck: data.likelyToPassCreditCheck,
      creditCheck: data.creditCheck || '',
      // Booking data
      bookingReference: data.bookingReference || '',
      selectedSlotStart: data.selectedSlotStart || '',
      selectedSlotEnd: data.selectedSlotEnd || '',
    };

    const interactionRow = mapToInteractionsRow(enrichedData);
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
