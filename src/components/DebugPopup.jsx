import { useBooking } from '../contexts';
import { isDebugMode } from '../config/env';

/**
 * Debug popup shown when ?debug=1 in URL.
 * Displays "answers collected" when prefill data has been received from parent.
 */
export function DebugPopup() {
  const { bookingData } = useBooking();

  if (!isDebugMode()) return null;

  const hasAnswers =
    bookingData.firstName ||
    bookingData.postcode ||
    bookingData.emailAddress ||
    bookingData.phoneNumber;

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        zIndex: 999999,
        background: '#1a1a2e',
        color: '#eee',
        font: '11px/1.4 monospace',
        padding: 10,
        borderRadius: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        border: '1px solid #333',
      }}
    >
      {hasAnswers && (
        <div
          style={{
            background: '#c0392b',
            color: '#fff',
            padding: '6px 10px',
            margin: '-10px -10px 10px -10px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          answers collected
        </div>
      )}
      <div style={{ marginBottom: 8, fontWeight: 700, color: '#9ecba7' }}>
        Solar Debug
      </div>
    </div>
  );
}
