import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useBooking } from './BookingContext';
import { config } from '../config/env';

const InactivityContext = createContext(null);

const INACTIVITY_TIMEOUT = 30000; // 30 seconds
const COUNTDOWN_SECONDS = 60; // 60-second countdown

export function InactivityProvider({ children }) {
  const { bookingData, setJourneyStatus, updateBookingData } = useBooking();
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
  const hasLoggedExitRef = useRef(false);
  const bookingDataRef = useRef(bookingData);

  // Keep bookingData ref in sync
  useEffect(() => {
    bookingDataRef.current = bookingData;
  }, [bookingData]);

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

  // --- API call helpers ---

  const fireAndForget = useCallback((endpoint, payload) => {
    fetch(`${config.projectSolarApiUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Best effort - silently fail
    });
  }, []);

  // Build a clean payload with all fields for edge functions
  const buildPayload = useCallback((data, overrides = {}) => {
    const journeyTimeSec = data.journeyStartTime
      ? Math.round((Date.now() - new Date(data.journeyStartTime).getTime()) / 1000)
      : 0;
    const timeOnPageSec = data.pageEnteredAt
      ? Math.round((Date.now() - new Date(data.pageEnteredAt).getTime()) / 1000)
      : 0;

    return {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      emailAddress: data.emailAddress || '',
      email: data.emailAddress || '',
      phoneNumber: data.phoneNumber || '',
      phone: data.phoneNumber || '',
      postcode: data.postcode || '',
      fullAddress: data.fullAddress || '',
      address: data.fullAddress || '',
      sessionId: data.sessionId || '',
      currentPage: data.currentPage || '',
      journeyStatus: data.journeyStatus || '',
      journeyStartTime: data.journeyStartTime || '',
      pageEnteredAt: data.pageEnteredAt || '',
      lastAction: data.lastAction || '',
      lastActionPage: data.lastActionPage || '',
      submissionId: data.submissionId || '',
      timeOnPage: timeOnPageSec,
      totalJourneyTime: journeyTimeSec,
      journeyTime: journeyTimeSec,
      totalPanelCount: data.totalPanelCount || 0,
      totalEstimatedEnergy: data.totalEstimatedEnergy || 0,
      estimatedAnnualSavings: data.estimatedAnnualSavings || 0,
      imageryQuality: data.imageryQuality || '',
      imageryDate: data.imageryDate || '',
      carbonOffset: data.carbonOffset || 0,
      solarRoofArea: data.solarRoofArea || 0,
      sunExposureHours: data.sunExposureHours || 0,
      roofSpaceOver10m2: data.roofSpaceOver10m2 ? 'Yes' : 'No',
      selectedSegmentsCount: Array.isArray(data.selectedSegments) ? data.selectedSegments.length : 0,
      isOver75: data.isOver75,
      roofWorksPlanned: data.roofWorksPlanned,
      incomeOver15k: data.incomeOver15k,
      likelyToPassCreditCheck: data.likelyToPassCreditCheck,
      bookingId: data.selectedSlot?.startTime || '',
      selectedSlotStart: data.selectedSlot?.startTime || '',
      selectedSlotEnd: data.selectedSlot?.endTime || '',
      ...overrides,
    };
  }, []);

  const logExit = useCallback((reason) => {
    const data = bookingDataRef.current;

    // Guards: skip if no session, on confirmation page, or already logged
    if (!data.sessionId) return;
    if (data.currentPage === '/confirmation') return;
    if (hasLoggedExitRef.current) return;

    hasLoggedExitRef.current = true;

    fireAndForget('log-exit', buildPayload(data, {
      exitReason: reason,
      exitTimestamp: new Date().toISOString(),
    }));
  }, [fireAndForget, buildPayload]);

  const logInteraction = useCallback((action) => {
    const data = bookingDataRef.current;
    if (!data.sessionId) return;

    fireAndForget('log-interaction', buildPayload(data, {
      action,
      actionTimestamp: new Date().toISOString(),
    }));
  }, [fireAndForget, buildPayload]);

  const submitBookingAsCallback = useCallback(() => {
    const data = bookingDataRef.current;
    if (!data.sessionId) return;

    fireAndForget('submit-booking', buildPayload(data, {
      action: 'session_expired',
      leadStatus: 'callback_required',
    }));
  }, [fireAndForget, buildPayload]);

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

    // Update booking context
    setJourneyStatus('session_expired');

    // Fire all three calls: log-exit, log-interaction, submit-booking
    logExit('session_expired');
    logInteraction('session_expired');
    submitBookingAsCallback();
  }, [clearAllTimers, setJourneyStatus, logExit, logInteraction, submitBookingAsCallback]);

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

  // --- Browser close / tab hidden detection ---

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logExit('tab_hidden');
      }
    };

    const handleBeforeUnload = () => {
      logExit('browser_closed');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [logExit]);

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
