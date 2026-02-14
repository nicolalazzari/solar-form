import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [bookingData, setBookingData] = useState({
    // User data from Chameleon form
    firstName: '',
    lastName: '',
    postcode: '',
    phoneNumber: '',
    emailAddress: '',

    // Address data
    fullAddress: '',
    latitude: null,
    longitude: null,
    originalLatitude: null,
    originalLongitude: null,
    locationManuallySelected: false,

    // Solar assessment data
    roofSegments: [],
    selectedSegments: [],
    totalPanelCount: 0,
    totalEstimatedEnergy: 0,
    estimatedAnnualSavings: 0,
    imageryQuality: '',
    imageryDate: '',
    imageryProcessedDate: '',
    roofChangedSinceImagery: null,
    carbonOffset: 0,
    solarRoofArea: 0,
    sunExposureHours: 0,
    roofSpaceOver10m2: false,

    // Eligibility data
    isOver75: null,
    roofWorksPlanned: null,
    incomeOver15k: null,
    likelyToPassCreditCheck: null,

    // Booking data
    selectedSlot: null,
    bookingReference: '',

    // Chameleon form submission
    submissionId: '',

    // Session data
    sessionId: '',
    journeyStartTime: null,
    pageEnteredAt: null,
    lastAction: '',
    lastActionPage: '',
    currentPage: '/',
    journeyStatus: 'started',
  });

  const initializeSession = useCallback(() => {
    setBookingData(prev => ({
      ...prev,
      sessionId: uuidv4(),
      journeyStartTime: new Date().toISOString(),
    }));
  }, []);

  const updateBookingData = useCallback((updates) => {
    setBookingData(prev => ({
      ...prev,
      ...updates,
      lastAction: updates.lastAction || prev.lastAction,
      lastActionPage: updates.lastActionPage || prev.lastActionPage,
      // Track when user enters a new page
      ...(updates.currentPage && updates.currentPage !== prev.currentPage
        ? { pageEnteredAt: new Date().toISOString() }
        : {}),
    }));
  }, []);

  const setUserData = useCallback((userData) => {
    updateBookingData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      postcode: userData.postcode || '',
      phoneNumber: userData.phoneNumber || '',
      emailAddress: userData.emailAddress || '',
    });
  }, [updateBookingData]);

  const setAddressData = useCallback((addressData) => {
    updateBookingData({
      postcode: addressData.postcode,
      fullAddress: addressData.fullAddress,
      latitude: addressData.latitude,
      longitude: addressData.longitude,
      originalLatitude: addressData.latitude,
      originalLongitude: addressData.longitude,
      locationManuallySelected: false,
      lastAction: 'address_selected',
      lastActionPage: '/address',
    });
  }, [updateBookingData]);

  const setManualLocation = useCallback((locationData) => {
    updateBookingData({
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      locationManuallySelected: true,
      lastAction: 'location_manually_selected',
      lastActionPage: '/solar-assessment',
    });
  }, [updateBookingData]);

  const setSolarAssessmentData = useCallback((solarData) => {
    updateBookingData({
      roofSegments: solarData.roofSegments,
      selectedSegments: solarData.selectedSegments,
      totalPanelCount: solarData.totalPanelCount,
      totalEstimatedEnergy: solarData.totalEstimatedEnergy,
      estimatedAnnualSavings: solarData.estimatedAnnualSavings,
      imageryQuality: solarData.imageryQuality,
      imageryDate: solarData.imageryDate,
      imageryProcessedDate: solarData.imageryProcessedDate || '',
      carbonOffset: solarData.carbonOffset,
      solarRoofArea: solarData.solarRoofArea || 0,
      sunExposureHours: solarData.sunExposureHours || 0,
      roofSpaceOver10m2: solarData.roofSpaceOver10m2 || false,
      lastAction: 'solar_assessment_completed',
      lastActionPage: '/solar-assessment',
    });
  }, [updateBookingData]);

  const setEligibilityData = useCallback((eligibilityData) => {
    updateBookingData({
      isOver75: eligibilityData.isOver75,
      roofWorksPlanned: eligibilityData.roofWorksPlanned,
      incomeOver15k: eligibilityData.incomeOver15k,
      likelyToPassCreditCheck: eligibilityData.likelyToPassCreditCheck,
      lastAction: 'eligibility_completed',
      lastActionPage: '/eligibility-questions',
    });
  }, [updateBookingData]);

  const setBookingSlot = useCallback((slot) => {
    updateBookingData({
      selectedSlot: slot,
      lastAction: 'slot_selected',
      lastActionPage: '/slot-selection',
    });
  }, [updateBookingData]);

  const confirmBooking = useCallback((bookingReference) => {
    updateBookingData({
      bookingReference,
      journeyStatus: 'booking_confirmed',
      lastAction: 'booking_confirmed',
      lastActionPage: '/confirmation',
    });
  }, [updateBookingData]);

  const setJourneyStatus = useCallback((status) => {
    updateBookingData({ journeyStatus: status });
  }, [updateBookingData]);

  const value = {
    bookingData,
    initializeSession,
    updateBookingData,
    setUserData,
    setAddressData,
    setManualLocation,
    setSolarAssessmentData,
    setEligibilityData,
    setBookingSlot,
    confirmBooking,
    setJourneyStatus,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

export default BookingContext;
