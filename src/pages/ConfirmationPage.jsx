import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { bookingData, confirmBooking, updateBookingData, setBookingSlot } = useBooking();
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

      // Step 1: Book appointment via Project Solar API (POST book-appointment)
      // Normalize phone to E.164 UK format (+44...) for API validation.
      // Project Solar expects customer.mobile - UK mobile (07xxx) preferred; landlines may fail validation.
      const rawPhone = (bookingData.phoneNumber || '').trim();
      const digits = rawPhone.replace(/\D/g, '');
      let mobile = '';
      if (digits.length >= 10) {
        if (digits.startsWith('44') && digits.length >= 12) {
          mobile = '+' + digits;
        } else if (digits.startsWith('0') && digits.length === 11) {
          mobile = '+44' + digits.slice(1);
        } else if (digits.length === 10 || digits.length === 11) {
          mobile = '+44' + (digits.startsWith('0') ? digits.slice(1) : digits);
        }
      }

      const bookAppointmentPayload = {
        firstname: (bookingData.firstName || '').trim(),
        lastname: (bookingData.lastName || '').trim(),
        postcode: (bookingData.postcode || '').trim().replace(/\s/g, '').toUpperCase(),
        email: (bookingData.emailAddress || '').trim(),
        booking_date: bookingData.selectedSlot?.startTime || '',
        addressLine: (bookingData.fullAddress || '').trim(),
        mobile,
        provider_lead_id: String(bookingData.submissionId || bookingData.sessionId || ''),
      };

      const headers = {
        'Content-Type': 'application/json',
        ...(config.projectSolarMvfApiKey && { 'x-api-key': config.projectSolarMvfApiKey }),
      };

      console.log('[DEBUG] Booking appointment:', bookAppointmentPayload);

      const bookingResponse = await fetch(`${config.projectSolarMvfApiUrl}/book-appointment`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookAppointmentPayload),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json().catch(() => ({}));
        console.error('[ERROR] Appointment booking failed:', errorData);
        if (errorData.details) console.error('[ERROR] Validation details:', errorData.details);
        const details = errorData.details || errorData.errors || [];
        const detailMsg = Array.isArray(details) ? details.map(d => (typeof d === 'object' ? JSON.stringify(d) : d)).join('; ') : JSON.stringify(details);
        throw new Error(
          (errorData.error || errorData.reason || 'Failed to book appointment') +
          (detailMsg ? `: ${detailMsg}` : '')
        );
      }

      const bookingResult = await bookingResponse.json();
      console.log('[DEBUG] Appointment booking success:', bookingResult);

      // Step 2: Log booking to Google Sheets
      let generatedRef = bookingResult.booking_reference || bookingResult.bookingReference || bookingResult.id || '';
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
          generatedRef = generatedRef || data.bookingReference || '';
        }
        if (!generatedRef) {
          const year = new Date().getFullYear();
          const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
          generatedRef = `PS-${year}-${random}`;
        }
      } catch (sheetsError) {
        console.error('[WARN] Google Sheets logging error:', sheetsError);
        if (!generatedRef) {
          const year = new Date().getFullYear();
          const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
          generatedRef = `PS-${year}-${random}`;
        }
      }

      // Show booking confirmation (Project Solar booking succeeded)
      setBookingReference(generatedRef);
      setBookingConfirmed(true);
      confirmBooking(generatedRef);
    } catch (err) {
      console.error('Booking submission failed:', err);
      const errMsg = String(err?.message || '');
      const isSlotUnavailable = /time slot not available|410|slot.*unavailable/i.test(errMsg);
      const isPhoneValidation = /validation\.phone|customer\.mobile/i.test(errMsg);

      if (isSlotUnavailable) {
        updateBookingData({ lastError: 'slot_unavailable' });
      } else {
        updateBookingData({
          journeyStatus: 'callback_required',
          ...(isPhoneValidation && { lastError: 'phone_validation' }),
        });
      }
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
          <img
            src="https://images-ulpn.ecs.prd9.eu-west-1.mvfglobal.net/wp-content/uploads/2026/03/calendar_check_100dp_0F5132_FILL0_wght400_GRAD0_opsz48.svg"
            alt=""
            className={styles.checkIcon}
          />
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

  // Slot no longer available (410) - let user pick another
  if (bookingData.lastError === 'slot_unavailable') {
    const handlePickAnotherSlot = () => {
      setBookingSlot(null);
      updateBookingData({ lastError: null });
      navigate('/slot-selection');
    };
    return (
      <div className={styles.container}>
        <div className={styles.icon}>
          <svg viewBox="0 0 64 64" className={styles.warningIcon}>
            <circle cx="32" cy="32" r="30" fill="#ffc107" />
            <text x="32" y="42" textAnchor="middle" fontSize="32" fill="#000">!</text>
          </svg>
        </div>

        <h1 className={styles.title}>This slot is no longer available</h1>

        <p className={styles.message}>
          Someone else may have taken this appointment. Please choose another time.
        </p>

        <button
          type="button"
          className={styles.calendarButton}
          onClick={handlePickAnotherSlot}
        >
          Choose another slot
        </button>
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
          <g transform="translate(32, 32) scale(1.4) translate(-12, -12)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
              fill="#ffffff"
            />
          </g>
        </svg>
      </div>

      <h1 className={styles.title}>We'll give you a call</h1>

      <p className={styles.message}>
        {bookingData.lastError === 'phone_validation'
          ? "We need a mobile number to complete your booking online. One of our team will call you on the number below to arrange your appointment."
          : isDisqualified
            ? "Based on your answers, we'd like to discuss your options with you directly. One of our solar experts will call you soon."
            : "Thank you for your interest. One of our team will call you to discuss your solar options and arrange an appointment."}
      </p>

      <div className={styles.callbackInfo}>
        <p>We'll call you on:</p>
        <p className={styles.phoneNumber}>{bookingData.phoneNumber || 'your registered number'}</p>
        <p className={styles.callbackNote}>Usually within 24 hours</p>
        {bookingData.lastError === 'phone_validation' && (
          <p className={styles.callbackNote}>Or call us on 0800 112 3110 to complete your booking now.</p>
        )}
      </div>
    </div>
  );
}
