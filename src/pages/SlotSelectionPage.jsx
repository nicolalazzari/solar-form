import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBooking } from '../contexts';
import { config } from '../config/env';
import styles from './SlotSelectionPage.module.css';

const USE_MOCK_DATA = false;

// Generate mock slots for the next 5 days
// Time slots: 10am, 2pm, 6pm (90-minute appointments)
const generateMockSlots = () => {
  const slots = [];
  const now = new Date();
  let daysAdded = 0;
  let dayOffset = 1;

  // Get 5 weekdays (skipping weekends)
  while (daysAdded < 5) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      dayOffset++;
      continue;
    }

    // Three slots per day: 10am, 2pm, 6pm (90-minute duration)
    [10, 14, 18].forEach(hour => {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 90); // 90-minute appointment

      slots.push({
        id: `slot-${dayOffset}-${hour}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    });

    daysAdded++;
    dayOffset++;
  }

  return slots;
};

export default function SlotSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData, setBookingSlot, updateBookingData } = useBooking();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [accordionOpen, setAccordionOpen] = useState(false);

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setError('');

      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSlots(generateMockSlots());
        setLoading(false);
        return;
      }

      const postcode = (bookingData.postcode || '').trim().replace(/\s/g, '');
      const response = await fetch(
        `${config.projectSolarMvfApiUrl}/get-availability?postcode=${encodeURIComponent(postcode)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(config.projectSolarMvfApiKey && { 'x-api-key': config.projectSolarMvfApiKey }),
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const data = await response.json();

      // Transform get-availability response: { availability: [{ date: "DD-MM-YYYY", slots: ["10:00", "14:00"] }] }
      // to { id, startTime, endTime }
      const APPOINTMENT_DURATION_MINS = 90;
      const normalizedSlots = [];
      const availability = data.availability || data.slots || [];
      let slotIndex = 0;

      availability.forEach((daySlot) => {
        const dateStr = daySlot.date || ''; // DD-MM-YYYY
        const times = daySlot.slots || [];
        const [d, m, y] = dateStr.split('-').map(Number);
        if (!d || !m || !y) return;
        const year = y >= 100 ? y : 2000 + y;

        times.forEach((timeStr) => {
          const [hour, min] = (timeStr || '10:00').split(':').map(Number);
          const start = new Date(year, m - 1, d, hour || 10, min || 0, 0, 0);
          const end = new Date(start);
          end.setMinutes(end.getMinutes() + APPOINTMENT_DURATION_MINS);
          normalizedSlots.push({
            id: `slot-${slotIndex++}`,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
          });
        });
      });

      setSlots(normalizedSlots);
    } catch (err) {
      setError('Unable to load available slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupSlotsByDate = (slots) => {
    return slots.reduce((groups, slot) => {
      const date = new Date(slot.startTime).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
      return groups;
    }, {});
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleConfirm = () => {
    if (!selectedSlot) return;

    setBookingSlot(selectedSlot);

    updateBookingData({
      currentPage: '/confirmation',
      lastAction: 'slot_confirmed',
      lastActionPage: '/slot-selection',
    });

    navigate({ pathname: '/confirmation', search: location.search });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <h2 className={styles.loadingTitle}>Finding available appointments</h2>
          <p className={styles.loadingText}>
            Checking availability in your area...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2 className={styles.errorTitle}>Unable to load appointments</h2>
          <p className={styles.errorText}>{error}</p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={fetchAvailableSlots}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate(slots);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Choose your appointment</h1>

      <p className={styles.description}>
        Select a convenient time for your solar assessment appointment.
      </p>

      <div className={styles.accordion}>
        <button
          type="button"
          className={styles.accordionHeader}
          onClick={() => setAccordionOpen(prev => !prev)}
          aria-expanded={accordionOpen}
          aria-controls="appointment-accordion-content"
        >
          <span className={styles.accordionTitle}>What happens at an appointment?</span>
          <span className={`${styles.accordionIcon} ${accordionOpen ? styles.accordionIconOpen : ''}`}>
            &#9660;
          </span>
        </button>
        <div
          id="appointment-accordion-content"
          className={`${styles.accordionContent} ${accordionOpen ? styles.accordionContentOpen : ''}`}
        >
          <p className={styles.accordionBody}>
            Project Solar Panels experts will visit your home for a free home assessment - usually taking up to 1 hour 30 minutes. They'll leave you with a full breakdown of your next steps to going solar with Project Solar.
          </p>
        </div>
      </div>

      {USE_MOCK_DATA && (
        <div className={styles.uatBanner}>
          UAT Mode: Using mock appointment slots
        </div>
      )}

      {slots.length === 0 ? (
        <div className={styles.noSlots}>
          <p>No appointments available at the moment. Please try again later or contact us.</p>
        </div>
      ) : (
        <div className={styles.slotsContainer}>
          {Object.entries(groupedSlots).map(([date, dateSlots]) => (
            <div key={date} className={styles.dateGroup}>
              <h3 className={styles.dateHeader}>{formatDate(dateSlots[0].startTime)}</h3>

              <div className={styles.slotsList}>
                {dateSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={`${styles.slotCard} ${selectedSlot?.id === slot.id ? styles.selected : ''}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <span className={styles.slotTime}>
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                    {selectedSlot?.id === slot.id && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSlot && (
        <div className={styles.selectedSummary}>
          <span className={styles.summaryLabel}>Booking summary</span>
          <div className={styles.summaryRow}>
            <span className={styles.summaryField}>Name</span>
            <span className={styles.summaryValue}>
              {(bookingData.firstName || bookingData.lastName || '').trim() || '—'}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryField}>Appointment</span>
            <span className={styles.summaryValue}>
              {formatDate(selectedSlot.startTime)} at {formatTime(selectedSlot.startTime)}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryField}>Address</span>
            <span className={styles.summaryValue}>
              {bookingData.fullAddress || '—'}
            </span>
          </div>
        </div>
      )}

      <p className={styles.consentStatement}>
        By submitting this booking, you consent to MVF, trading as The Eco Experts, sharing your details with Project Solar to arrange and discuss your solar appointment. Project Solar may contact you by telephone (including automated calls), SMS, email, post or OTT messaging services such as WhatsApp for this purpose. You can withdraw your consent at any time.
      </p>

      <button
        type="button"
        className={styles.confirmButton}
        onClick={handleConfirm}
        disabled={!selectedSlot}
      >
        Confirm appointment
      </button>
    </div>
  );
}
