import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProgressIndicator from './ProgressIndicator';
import InactivityModal from '../common/InactivityModal';
import { useInactivity, useBooking } from '../../contexts';
import styles from './BookingLayout.module.css';

const STEPS = [
  { path: '/address', label: 'Address', step: 1 },
  { path: '/solar-assessment', label: 'Solar Assessment', step: 2 },
  { path: '/eligibility-questions', label: 'Eligibility', step: 3 },
  { path: '/slot-selection', label: 'Select Slot', step: 4 },
  { path: '/confirmation', label: 'Confirmation', step: 5 },
];

export default function BookingLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showWarningModal, countdown, handleStayActive, isSessionExpired } = useInactivity();
  const { bookingData } = useBooking();

  // Navigate to confirmation page when session expires
  useEffect(() => {
    if (isSessionExpired && location.pathname !== '/confirmation') {
      navigate('/confirmation');
    }
  }, [isSessionExpired, location.pathname, navigate]);

  const currentStepIndex = STEPS.findIndex(step => step.path === location.pathname);
  const currentStep = currentStepIndex !== -1 ? currentStepIndex + 1 : 0;
  const totalSteps = STEPS.length;

  const isEligibilityPage = location.pathname === '/eligibility-questions';
  const canGoBack = currentStep > 1 && currentStep < totalSteps && !isEligibilityPage;

  const handleBack = () => {
    if (canGoBack) {
      const previousStep = STEPS[currentStepIndex - 1];
      navigate({ pathname: previousStep.path, search: location.search });
    }
  };

  // For landing page (IndexPage), render children directly without any wrapper
  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return (
      <>
        {children}
        {showWarningModal && (
          <InactivityModal countdown={countdown} onStayActive={handleStayActive} />
        )}
      </>
    );
  }

  // For journey pages, render with progress indicator and back button
  return (
    <div className={styles.iframeContent}>
      {currentStep > 0 && (
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      )}

      {canGoBack && (
        <button className={styles.backButton} onClick={handleBack} type="button">
          <span className={styles.backIcon}>&#8592;</span>
          Back
        </button>
      )}

      <div className={styles.content}>
        {children}
      </div>

      {showWarningModal && (
        <InactivityModal countdown={countdown} onStayActive={handleStayActive} />
      )}
    </div>
  );
}
