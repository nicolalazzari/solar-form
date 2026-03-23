import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useBooking } from './BookingContext';

const InactivityContext = createContext(null);

const INACTIVITY_TIMEOUT = 30000; // 30 seconds
const COUNTDOWN_SECONDS = 30; // 30-second countdown

export function InactivityProvider({ children }) {
  const { bookingData, setJourneyStatus } = useBooking();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Refs for timer handles
  const inactivityTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Refs for stable access inside callbacks (avoids stale closures)
  const hasExpiredRef = useRef(false);
  const showModalRef = useRef(false);
  const manualTrackingRef = useRef(false);

  // Keep showModal ref in sync
  useEffect(() => {
    showModalRef.current = showWarningModal;
  }, [showWarningModal]);

  // Derived state
  const currentPage = bookingData.currentPage;
  const isLandingPage = currentPage === '/';
  const isConfirmationPage = currentPage === '/confirmation';
  const journeyComplete = ['booking_confirmed', 'callback_required', 'session_expired'].includes(
    bookingData.journeyStatus
  );

  // --- Timer management ---

  const clearAllTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const handleSessionExpiry = useCallback(() => {
    if (hasExpiredRef.current) return;
    hasExpiredRef.current = true;

    clearAllTimers();
    setShowWarningModal(false);
    setIsSessionExpired(true);
    setCountdown(0);

    setJourneyStatus('session_expired');
  }, [clearAllTimers, setJourneyStatus]);

  const startCountdown = useCallback(() => {
    setCountdown(COUNTDOWN_SECONDS);

    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
          handleSessionExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleSessionExpiry]);

  const resetInactivityTimer = useCallback(() => {
    // Don't restart if session has expired or journey is complete
    if (hasExpiredRef.current || journeyComplete) return;
    // Don't track on confirmation page
    if (isConfirmationPage) return;
    // Don't auto-track on landing page (requires manual startTracking)
    if (isLandingPage && !manualTrackingRef.current) return;

    clearAllTimers();

    setShowWarningModal(false);
    setCountdown(COUNTDOWN_SECONDS);

    inactivityTimerRef.current = setTimeout(() => {
      setShowWarningModal(true);
      startCountdown();
    }, INACTIVITY_TIMEOUT);
  }, [isLandingPage, isConfirmationPage, journeyComplete, clearAllTimers, startCountdown]);

  // Manual tracking activation (called from landing page when user clicks "book online")
  const startTracking = useCallback(() => {
    manualTrackingRef.current = true;
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const handleStayActive = useCallback(() => {
    resetInactivityTimer();
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'solar-optly-keep-alive' }, '*');
    }
  }, [resetInactivityTimer]);

  // --- Activity listeners ---

  useEffect(() => {
    // Don't attach listeners if expired, journey complete, or on confirmation
    if (hasExpiredRef.current || journeyComplete || isConfirmationPage) return;
    // On landing page, only listen if manually tracking
    if (isLandingPage && !manualTrackingRef.current) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      // Don't reset while modal is showing - user must click the button
      if (showModalRef.current) return;
      if (hasExpiredRef.current) return;
      resetInactivityTimer();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Start the timer when listeners are attached
    resetInactivityTimer();

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearAllTimers();
    };
  }, [isLandingPage, isConfirmationPage, journeyComplete, resetInactivityTimer, clearAllTimers]);

  // --- Stop tracking when journey completes ---

  useEffect(() => {
    if (journeyComplete) {
      clearAllTimers();
      setShowWarningModal(false);
    }
  }, [journeyComplete, clearAllTimers]);

  const value = {
    showWarningModal,
    countdown,
    isSessionExpired,
    handleStayActive,
    resetInactivityTimer,
    startTracking,
  };

  return (
    <InactivityContext.Provider value={value}>
      {children}
    </InactivityContext.Provider>
  );
}

export function useInactivity() {
  const context = useContext(InactivityContext);
  if (!context) {
    throw new Error('useInactivity must be used within an InactivityProvider');
  }
  return context;
}

export default InactivityContext;
