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

function calcTimeOnPage(pageEnteredAt: string | null): string {
  if (!pageEnteredAt) return '';
  const entered = new Date(pageEnteredAt).getTime();
  if (isNaN(entered)) return '';
  const seconds = Math.round((Date.now() - entered) / 1000);
  return String(seconds);
}

function calcSelectedSegmentsCount(segments: unknown): string {
  if (Array.isArray(segments)) return String(segments.length);
  if (typeof segments === 'number') return String(segments);
  return '';
}

function calcAppointmentWithin5Days(data: Data): string {
  // Support both object (selectedSlot.startTime) and flat field (selectedSlotStart)
  let startTime: string | undefined;
  if (data.selectedSlot && typeof data.selectedSlot === 'object') {
    startTime = (data.selectedSlot as Data).startTime;
  } else {
    startTime = data.selectedSlotStart;
  }
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
    /* D  Email                      */ data.emailAddress || data.email || '',
    /* E  Phone                      */ data.phoneNumber || data.phone || '',
    /* F  Postcode                   */ data.postcode || '',
    /* G  Full Address               */ data.fullAddress || data.address || '',
    /* H  Project Solar Booking ID   */ data.bookingReference || data.bookingId || '',
    /* I  Homeowner                  */ '',
    /* J  Roof Space ≥10m²           */ data.roofSpaceOver10m2 || '',
    /* K  Solar Roof Area            */ (data.solarRoofArea !== null && data.solarRoofArea !== undefined ? String(data.solarRoofArea) : ''),
    /* L  Sun Exposure Hours/Year    */ (data.sunExposureHours !== null && data.sunExposureHours !== undefined ? String(data.sunExposureHours) : ''),
    /* M  Already Have Solar         */ '',
    /* N  Aged over 75               */ (data.ageOver75 && data.ageOver75 !== '' ? data.ageOver75 : boolToYesNo(data.isOver75)),
    /* O  Conservation/Listed        */ '',
    /* P  Roof Works Planned         */ (data.roofWorks && data.roofWorks !== '' ? data.roofWorks : boolToYesNo(data.roofWorksPlanned)),
    /* Q  Income >£15K               */ (data.income && data.income !== '' ? data.income : boolToYesNo(data.incomeOver15k)),
    /* R  Appointment Within 5 Days  */ calcAppointmentWithin5Days(data),
    /* S  Likely to pass credit check*/ (data.creditCheck && data.creditCheck !== '' ? data.creditCheck : boolToYesNo(data.likelyToPassCreditCheck)),
    /* T  Lead Status                */ data.leadStatus || data.journeyStatus || '',
    /* U  Property Type              */ '',
    /* V  Bedrooms                   */ '',
    /* W  Property Usage             */ '',
    /* X  Submission ID              */ data.submissionId || '',
    /* Y  Current Page               */ data.currentPage || '',
    /* Z  Action                     */ data.action || '',
    /* AA Journey Status             */ data.journeyStatus || '',
    /* AB Time on Page (s)           */ data.timeOnPage ?? calcTimeOnPage(data.pageEnteredAt),
    /* AC Total Journey Time (s)     */ data.totalJourneyTime ?? calcTotalJourneyTime(data.journeyStartTime),
    /* AD Last Action                */ data.lastAction || '',
    /* AE Last Action Page           */ data.lastActionPage || '',
    /* AF Total Panel Count          */ (data.totalPanelCount !== null && data.totalPanelCount !== undefined ? String(data.totalPanelCount) : ''),
    /* AG Total Estimated Energy     */ (data.totalEstimatedEnergy !== null && data.totalEstimatedEnergy !== undefined ? String(data.totalEstimatedEnergy) : ''),
    /* AH Estimated Annual Savings   */ (data.estimatedAnnualSavings !== null && data.estimatedAnnualSavings !== undefined ? String(data.estimatedAnnualSavings) : ''),
    /* AI Imagery Quality            */ data.imageryQuality || '',
    /* AJ Imagery Date               */ data.imageryDate || '',
    /* AK Selected Segments Count    */ calcSelectedSegmentsCount(data.selectedSegments ?? data.selectedSegmentsCount),
    /* AL Carbon Offset (kg/year)    */ (data.carbonOffset !== null && data.carbonOffset !== undefined ? String(data.carbonOffset) : ''),
    /* AM Session ID                 */ data.sessionId || '',
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
