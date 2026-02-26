import { useEffect, useState } from 'react';
import { useBooking } from '../contexts';
import { config } from '../config/env';
import styles from './ConfirmationPage.module.css';

const USE_MOCK_DATA = false;

// Generate a mock booking reference
const generateMockReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `PS-UAT-${timestamp}`;
};

export default function ConfirmationPage() {
  const { bookingData, confirmBooking, updateBookingData } = useBooking();
  const [loading, setLoading] = useState(true);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  const isDisqualified = bookingData.journeyStatus?.startsWith('disqualified') || false;
  const isSessionExpired = bookingData.journeyStatus === 'session_expired';
  const isCallbackRequired = bookingData.journeyStatus === 'callback_required';

  useEffect(() => {
    if (bookingData.selectedSlot && !isDisqualified && !isSessionExpired && !isCallbackRequired) {
      submitBooking();
    } else {
      setLoading(false);
    }
  }, []);

  const submitBooking = async () => {
    try {
      setLoading(true);

      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockRef = generateMockReference();
        setBookingReference(mockRef);
        setBookingConfirmed(true);
        confirmBooking(mockRef);
        setLoading(false);
        return;
      }

      // Build a clean flat payload with only scalar values for the edge function
      const journeyTimeSec = bookingData.journeyStartTime
        ? Math.round((Date.now() - new Date(bookingData.journeyStartTime).getTime()) / 1000)
        : 0;
      const timeOnPageSec = bookingData.pageEnteredAt
        ? Math.round((Date.now() - new Date(bookingData.pageEnteredAt).getTime()) / 1000)
        : 0;

      const payload = {
        firstName: bookingData.firstName || '',
        lastName: bookingData.lastName || '',
        emailAddress: bookingData.emailAddress || '',
        email: bookingData.emailAddress || '',
        phoneNumber: bookingData.phoneNumber || '',
        phone: bookingData.phoneNumber || '',
        postcode: bookingData.postcode || '',
        fullAddress: bookingData.fullAddress || '',
        address: bookingData.fullAddress || '',
        sessionId: bookingData.sessionId || '',
        currentPage: bookingData.currentPage || '',
        journeyStatus: bookingData.journeyStatus || '',
        journeyStartTime: bookingData.journeyStartTime || '',
        pageEnteredAt: bookingData.pageEnteredAt || '',
        lastAction: bookingData.lastAction || '',
        lastActionPage: bookingData.lastActionPage || '',
        submissionId: bookingData.submissionId || '',
        action: 'booking_confirmed',
        leadStatus: 'Booked',
        // Pre-calculated time values
        timeOnPage: timeOnPageSec,
        totalJourneyTime: journeyTimeSec,
        journeyTime: journeyTimeSec,
        // Solar data (scalars only — use String() so 0 survives || checks in deployed function)
        totalPanelCount: bookingData.totalPanelCount || 0,
        totalEstimatedEnergy: bookingData.totalEstimatedEnergy || 0,
        estimatedAnnualSavings: bookingData.estimatedAnnualSavings || 0,
        imageryQuality: bookingData.imageryQuality || '',
        imageryDate: bookingData.imageryDate || '',
        carbonOffset: bookingData.carbonOffset ?? 0,
        solarRoofArea: bookingData.solarRoofArea ?? 0,
        sunExposureHours: bookingData.sunExposureHours ?? 0,
        roofSpaceOver10m2: bookingData.roofSpaceOver10m2 ? 'Yes' : 'No',
        selectedSegmentsCount: Array.isArray(bookingData.selectedSegments) ? bookingData.selectedSegments.length : 0,
        // Eligibility (send both boolean and string versions for deployed function compatibility)
        isOver75: bookingData.isOver75,
        ageOver75: bookingData.isOver75 === true ? 'Yes' : bookingData.isOver75 === false ? 'No' : '',
        roofWorksPlanned: bookingData.roofWorksPlanned,
        roofWorks: bookingData.roofWorksPlanned === true ? 'Yes' : bookingData.roofWorksPlanned === false ? 'No' : '',
        incomeOver15k: bookingData.incomeOver15k,
        income: bookingData.incomeOver15k === true ? 'Yes' : bookingData.incomeOver15k === false ? 'No' : '',
        likelyToPassCreditCheck: bookingData.likelyToPassCreditCheck,
        creditCheck: bookingData.likelyToPassCreditCheck === true ? 'Yes' : bookingData.likelyToPassCreditCheck === false ? 'No' : '',
        // Slot (flat scalars only — objects break Sheets write)
        bookingId: bookingData.selectedSlot?.startTime || '',
        bookingReference: bookingData.selectedSlot?.startTime || '',
        selectedSlotStart: bookingData.selectedSlot?.startTime || '',
        selectedSlotEnd: bookingData.selectedSlot?.endTime || '',
      };

      console.log('[DEBUG] Eligibility fields being sent:', {
        isOver75: payload.isOver75,
        ageOver75: payload.ageOver75,
        roofWorksPlanned: payload.roofWorksPlanned,
        roofWorks: payload.roofWorks,
        incomeOver15k: payload.incomeOver15k,
        income: payload.income,
        likelyToPassCreditCheck: payload.likelyToPassCreditCheck,
        creditCheck: payload.creditCheck,
      });

      // Step 1: Book appointment with Project Solar API
      const formatBookingDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
      };

      const projectSolarPayload = {
        firstname: bookingData.firstName || '',
        lastname: bookingData.lastName || '',
        email: bookingData.emailAddress || '',
        mobile: bookingData.phoneNumber || '',
        postcode: bookingData.postcode || '',
        addressLine: bookingData.fullAddress || '',
        bookingDate: formatBookingDate(bookingData.selectedSlot?.startTime),
        providerLeadId: bookingData.submissionId || '',
      };

      console.log('[DEBUG] Booking with Project Solar:', projectSolarPayload);

      const bookingResponse = await fetch(`${config.projectSolarApiUrl}/book-appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectSolarPayload),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json().catch(() => ({}));
        console.error('[ERROR] Project Solar booking failed:', errorData);
        throw new Error(errorData.error || 'Failed to book appointment with Project Solar');
      }

      const bookingResult = await bookingResponse.json();
      console.log('[DEBUG] Project Solar booking success:', bookingResult);

      // Step 2: Log booking to Google Sheets
      let generatedRef = '';
      try {
        const response = await fetch(`${config.projectSolarApiUrl}/submit-booking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.supabaseAnonKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[DEBUG] Google Sheets log response:', data);
          generatedRef = data.bookingReference || '';
        } else {
          console.error('[WARN] Google Sheets logging failed, but booking succeeded');
          // Generate a reference anyway since booking succeeded
          const year = new Date().getFullYear();
          const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
          generatedRef = `PS-${year}-${random}`;
        }
      } catch (sheetsError) {
        console.error('[WARN] Google Sheets logging error:', sheetsError);
        // Generate a reference anyway since booking succeeded
        const year = new Date().getFullYear();
        const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
        generatedRef = `PS-${year}-${random}`;
      }

      // Show booking confirmation (Project Solar booking succeeded)
      setBookingReference(generatedRef);
      setBookingConfirmed(true);
      confirmBooking(generatedRef);
    } catch (err) {
      console.error('Booking submission failed:', err);
      // If booking fails, show callback required
      updateBookingData({ journeyStatus: 'callback_required' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generateICSFile = () => {
    if (!bookingData.selectedSlot) return;

    const startDate = new Date(bookingData.selectedSlot.startTime);
    const endDate = new Date(bookingData.selectedSlot.endTime);

    const formatICSDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Project Solar//Booking//EN
BEGIN:VEVENT
UID:${bookingReference}@projectsolar.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Solar Assessment Appointment
DESCRIPTION:Your solar panel assessment appointment with Project Solar.\\nBooking Reference: ${bookingReference}
LOCATION:${bookingData.fullAddress}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solar-appointment-${bookingReference}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <h2 className={styles.loadingTitle}>Confirming your booking</h2>
          <p className={styles.loadingText}>Please wait...</p>
        </div>
      </div>
    );
  }

  // Booking confirmed successfully
  if (bookingConfirmed) {
    return (
      <div className={styles.container}>
        {USE_MOCK_DATA && (
          <div className={styles.uatBanner}>
            UAT Mode: Mock booking confirmation
          </div>
        )}

        <div className={styles.icon}>
          <svg viewBox="0 0 64 64" className={styles.checkIcon}>
            <circle cx="32" cy="32" r="30" fill="#03624C" />
            <path
              d="M20 32 L28 40 L44 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className={styles.title}>Booking confirmed!</h1>

        <p className={styles.message}>
          Your solar assessment appointment has been booked successfully.
        </p>

        <div className={styles.bookingDetails}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Reference</span>
            <span className={styles.detailValue}>{bookingReference}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Date</span>
            <span className={styles.detailValue}>
              {formatDate(bookingData.selectedSlot?.startTime)}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Time</span>
            <span className={styles.detailValue}>
              {formatTime(bookingData.selectedSlot?.startTime)} - {formatTime(bookingData.selectedSlot?.endTime)}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Address</span>
            <span className={styles.detailValue}>{bookingData.fullAddress}</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.calendarButton}
          onClick={generateICSFile}
        >
          Add to calendar
        </button>

        <p className={styles.note}>
          A confirmation email has been sent to {bookingData.emailAddress || 'your email address'}
        </p>
      </div>
    );
  }

  // Session expired
  if (isSessionExpired) {
    return (
      <div className={styles.container}>
        <div className={styles.icon}>
          <svg viewBox="0 0 64 64" className={styles.warningIcon}>
            <circle cx="32" cy="32" r="30" fill="#ffc107" />
            <text x="32" y="42" textAnchor="middle" fontSize="32" fill="#000">!</text>
          </svg>
        </div>

        <h1 className={styles.title}>Session expired</h1>

        <p className={styles.message}>
          Your session has timed out due to inactivity. Don't worry - one of our team will call you to arrange an appointment.
        </p>

        <p className={styles.note}>
          We'll call you on {bookingData.phoneNumber || 'your registered number'} within 24 hours.
        </p>
      </div>
    );
  }

  // Callback required (disqualified or user chose callback)
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <svg viewBox="0 0 64 64" className={styles.phoneIcon}>
          <circle cx="32" cy="32" r="30" fill="#55bfe5" />
          <path
            d="M24 22 L24 28 C24 38 28 42 40 42 L40 34 L40 28 C40 24 36 22 24 22"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className={styles.title}>We'll give you a call</h1>

      <p className={styles.message}>
        {isDisqualified
          ? "Based on your answers, we'd like to discuss your options with you directly. One of our solar experts will call you soon."
          : "Thank you for your interest. One of our team will call you to discuss your solar options and arrange an appointment."}
      </p>

      <div className={styles.callbackInfo}>
        <p>We'll call you on:</p>
        <p className={styles.phoneNumber}>{bookingData.phoneNumber || 'your registered number'}</p>
        <p className={styles.callbackNote}>Usually within 24 hours</p>
      </div>
    </div>
  );
}
