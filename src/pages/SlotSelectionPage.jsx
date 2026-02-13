import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { bookingData, setBookingSlot, updateBookingData } = useBooking();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

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

      const response = await fetch(
        `${config.projectSolarApiUrl}/booking-slots`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.supabaseAnonKey}`,
          },
          body: JSON.stringify({ postcode: bookingData.postcode || '' }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const data = await response.json();

      // Transform API response to expected slot format
      // API returns: { datetime, displayDate, displayTime, dayOfWeek }
      // We need: { id, startTime, endTime }
      const APPOINTMENT_DURATION_MINS = 90;
      const normalizedSlots = (data.slots || data.availability || data || []).map((slot, index) => {
        const startTime = slot.startTime || slot.start_time || slot.datetime;
        let endTime = slot.endTime || slot.end_time;

        // If no endTime provided, calculate from startTime + appointment duration
        if (!endTime && startTime) {
          const end = new Date(startTime);
          end.setMinutes(end.getMinutes() + APPOINTMENT_DURATION_MINS);
          endTime = end.toISOString();
        }

        return {
          id: slot.id || `slot-${index}`,
          startTime,
          endTime,
        };
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

    navigate('/confirmation');
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
          <span className={styles.summaryLabel}>Selected appointment:</span>
          <span className={styles.summaryValue}>
            {formatDate(selectedSlot.startTime)} at {formatTime(selectedSlot.startTime)}
          </span>
        </div>
      )}

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
