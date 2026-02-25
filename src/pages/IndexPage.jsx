import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking, useInactivity } from '../contexts';
import styles from './IndexPage.module.css';

export default function IndexPage() {
  const navigate = useNavigate();
  const { initializeSession, setUserData, updateBookingData } = useBooking();
  const { startTracking } = useInactivity();
  const [showCallbackConfirmation, setShowCallbackConfirmation] = useState(false);

  const handleBookOnline = () => {
    // Initialize session and capture data from MVF data layer
    initializeSession();

    // Get user data from MVF/Chameleon data layer (window.dataLayer)
    // Field names use dataLayer.answers[field_name] format
    // TODO: Update field names once confirmed by Team Gold
    if (typeof window !== 'undefined' && window.dataLayer?.answers) {
      const answers = window.dataLayer.answers;
      const userData = {
        firstName: answers['first_name'] || '',
        lastName: answers['last_name'] || '',
        postcode: answers['primary_address_postalcode'] || '',
        phoneNumber: answers['phone_number'] || '',
        emailAddress: answers['email_address'] || '',
      };
      setUserData(userData);

      updateBookingData({
        submissionId: window.dataLayer.submissionId || window.dataLayer.submission_id || '',
      });
    } else if (import.meta.env.DEV) {
      // Dev fallback: populate test data when no Chameleon data layer exists
      setUserData({
        firstName: 'Test',
        lastName: 'User',
        postcode: '',
        phoneNumber: '07700900000',
        emailAddress: 'test@example.com',
      });
    }

    updateBookingData({
      currentPage: '/address',
      lastAction: 'book_online_clicked',
      lastActionPage: '/',
    });

    // Start inactivity tracking now that the user has begun the journey
    startTracking();

    navigate('/address');
  };

  const handleNoThanks = () => {
    updateBookingData({
      journeyStatus: 'callback_required',
      lastAction: 'no_thanks_clicked',
      lastActionPage: '/',
    });

    setShowCallbackConfirmation(true);
  };

  return (
    <div className={styles.modalContent}>
      {!showCallbackConfirmation ? (
        <>
          <div className={styles.calendarIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#03624C" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <rect x="7" y="14" width="4" height="4" fill="#03624C" stroke="none" />
            </svg>
          </div>
          <h2 className={styles.modalTitle}>Would you like to book an appointment online?</h2>

          <p className={styles.helperText}>
            We'll ask you a few more quick questions & you can book directly with <strong>Project Solar</strong>.
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleBookOnline}
            >
              Yes, book online
            </button>

            <div className={styles.noThanksBlock}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleNoThanks}
              >
                No, thank you
              </button>
              <p className={styles.noThanksSubtext}>
                A member of our team will be in touch shortly to book an appointment
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.callbackConfirmation}>
          <div className={styles.callbackIcon}>
            <svg viewBox="0 0 64 64">
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
          <p className={styles.callbackMessage}>
            A member of our team will be in touch shortly to book an appointment
          </p>
          <p className={styles.phoneNumber}>0800 112 3110</p>
          <p className={styles.callbackNote}>
            Keep your phone nearby - answering now helps secure your savings and earliest install date.
          </p>
        </div>
      )}
    </div>
  );
}
