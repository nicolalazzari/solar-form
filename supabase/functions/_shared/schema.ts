/**
 * Column mapping functions for Google Sheets.
 *
 * Sheet1 (Main Leads): 39 columns
 * Interactions tab: 14 columns
 */

// deno-lint-ignore no-explicit-any
type Data = Record<string, any>;

function boolToYesNo(val: unknown): string {
  if (val === true) return 'Yes';
  if (val === false) return 'No';
  return '';
}

function calcTotalJourneyTime(journeyStartTime: string | null): string {
  if (!journeyStartTime) return '';
  const start = new Date(journeyStartTime).getTime();
  if (isNaN(start)) return '';
  const seconds = Math.round((Date.now() - start) / 1000);
  return String(seconds);
}

function calcSelectedSegmentsCount(segments: unknown): string {
  if (Array.isArray(segments)) return String(segments.length);
  if (typeof segments === 'number') return String(segments);
  return '';
}

function calcAppointmentWithin5Days(selectedSlot: unknown): string {
  if (!selectedSlot || typeof selectedSlot !== 'object') return '';
  const startTime = (selectedSlot as Data).startTime;
  if (!startTime) return '';
  const slotDate = new Date(startTime).getTime();
  if (isNaN(slotDate)) return '';
  const fiveDays = 5 * 24 * 60 * 60 * 1000;
  return slotDate - Date.now() <= fiveDays ? 'Yes' : 'No';
}

/**
 * Maps frontend bookingData payload to a 39-element array
 * matching the Sheet1 column order.
 */
export function mapToSheet1Row(data: Data): unknown[] {
  return [
    /* A  Submission Timestamp       */ new Date().toISOString(),
    /* B  First Name                 */ data.firstName || '',
    /* C  Last Name                  */ data.lastName || '',
    /* D  Email                      */ data.emailAddress || '',
    /* E  Phone                      */ data.phoneNumber || '',
    /* F  Postcode                   */ data.postcode || '',
    /* G  Full Address               */ data.fullAddress || '',
    /* H  Project Solar Booking ID   */ data.bookingReference || '',
    /* I  Homeowner                  */ '',
    /* J  Roof Space ≥10m²           */ '',
    /* K  Solar Roof Area            */ data.solarRoofArea || '',
    /* L  Sun Exposure Hours/Year    */ data.sunExposureHours || '',
    /* M  Already Have Solar         */ '',
    /* N  Aged over 75               */ boolToYesNo(data.isOver75),
    /* O  Conservation/Listed        */ '',
    /* P  Roof Works Planned         */ boolToYesNo(data.roofWorksPlanned),
    /* Q  Income >£15K               */ boolToYesNo(data.incomeOver15k),
    /* R  Appointment Within 5 Days  */ calcAppointmentWithin5Days(data.selectedSlot),
    /* S  Likely to pass credit check*/ boolToYesNo(data.likelyToPassCreditCheck),
    /* T  Lead Status                */ data.leadStatus || data.journeyStatus || '',
    /* U  Property Type              */ '',
    /* V  Bedrooms                   */ '',
    /* W  Property Usage             */ '',
    /* X  Session ID                 */ data.sessionId || '',
    /* Y  Current Page               */ data.currentPage || '',
    /* Z  Action                     */ data.action || '',
    /* AA Journey Status             */ data.journeyStatus || '',
    /* AB Time on Page (s)           */ '',
    /* AC Total Journey Time (s)     */ calcTotalJourneyTime(data.journeyStartTime),
    /* AD Last Action                */ data.lastAction || '',
    /* AE Last Action Page           */ data.lastActionPage || '',
    /* AF Total Panel Count          */ data.totalPanelCount ?? '',
    /* AG Total Estimated Energy     */ data.totalEstimatedEnergy ?? '',
    /* AH Estimated Annual Savings   */ data.estimatedAnnualSavings ?? '',
    /* AI Imagery Quality            */ data.imageryQuality || '',
    /* AJ Imagery Date               */ data.imageryDate || '',
    /* AK Selected Segments Count    */ calcSelectedSegmentsCount(data.selectedSegments),
    /* AL Carbon Offset (kg/year)    */ data.carbonOffset ?? '',
    /* AM Submission ID              */ data.submissionId || '',
  ];
}

/**
 * Maps frontend payload to a 14-element array
 * matching the Interactions tab column order.
 */
export function mapToInteractionsRow(data: Data): unknown[] {
  return [
    /* A  Timestamp          */ new Date().toISOString(),
    /* B  Session ID         */ data.sessionId || '',
    /* C  First Name         */ data.firstName || '',
    /* D  Last Name          */ data.lastName || '',
    /* E  Email              */ data.emailAddress || '',
    /* F  Phone              */ data.phoneNumber || '',
    /* G  Postcode           */ data.postcode || '',
    /* H  Action             */ data.action || data.exitReason || '',
    /* I  Current Page       */ data.currentPage || '',
    /* J  Journey Status     */ data.journeyStatus || '',
    /* K  Last Action        */ data.lastAction || '',
    /* L  Last Action Page   */ data.lastActionPage || '',
    /* M  Total Journey Time */ calcTotalJourneyTime(data.journeyStartTime),
    /* N  Submission ID      */ data.submissionId || '',
  ];
}
