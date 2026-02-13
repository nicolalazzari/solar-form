import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { BookingProvider, InactivityProvider } from './contexts';
import { BookingLayout, DemoPageLayout } from './components/layout';
import {
  LoaderTransitionPage,
  IndexPage,
  AddressPage,
  SolarAssessmentPage,
  EligibilityQuestionsPage,
  SlotSelectionPage,
  ConfirmationPage,
} from './pages';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isLoaderPage = location.pathname === '/loader';

  // Loader page renders without any wrapper
  if (isLoaderPage) {
    return <LoaderTransitionPage />;
  }

  // All other pages render inside the DemoPageLayout (persistent page background)
  // with BookingLayout handling the iframe content styling
  return (
    <DemoPageLayout>
      <BookingLayout>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/address" element={<AddressPage />} />
          <Route path="/solar-assessment" element={<SolarAssessmentPage />} />
          <Route path="/eligibility-questions" element={<EligibilityQuestionsPage />} />
          <Route path="/slot-selection" element={<SlotSelectionPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
        </Routes>
      </BookingLayout>
    </DemoPageLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <BookingProvider>
        <InactivityProvider>
          <Routes>
            <Route path="/loader" element={<LoaderTransitionPage />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </InactivityProvider>
      </BookingProvider>
    </BrowserRouter>
  );
}

export default App;
