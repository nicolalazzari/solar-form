import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { BookingProvider, InactivityProvider } from './contexts';
import { useBooking } from './contexts';
import { BookingLayout, DemoPageLayout } from './components/layout';
import { PrefillBridge } from './components/PrefillBridge';
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

function QueryPrefillBridge() {
  const location = useLocation();
  const { bookingData, updateBookingData } = useBooking();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const updates = {};

    const rawPostcode = params.get('prefill_postcode');
    if (rawPostcode) {
      const postcode = rawPostcode.replace(/\s/g, '').toUpperCase();
      if (postcode && bookingData.postcode !== postcode) {
        updates.postcode = postcode;
      }
    }

    const rawFirstName = params.get('prefill_first_name');
    if (rawFirstName) {
      const firstName = rawFirstName.trim();
      if (firstName && bookingData.firstName !== firstName) {
        updates.firstName = firstName;
      }
    }

    if (Object.keys(updates).length > 0) {
      updateBookingData(updates);
    }
  }, [location.search, bookingData.postcode, bookingData.firstName, updateBookingData]);

  return null;
}

function IframeAutoHeightBridge() {
  const location = useLocation();

  useEffect(() => {
    if (window.parent === window) return undefined;

    const HEIGHT_DEBUG_PREFIX = '[Solar Iframe Child]';
    var rafId = null;
    var lastHeight = 0;
    var resizeObserver = null;
    var mutationObserver = null;
    var timeoutIds = [];

    const getContentHeight = () => {
      const body = document.body;
      const html = document.documentElement;
      const root = document.getElementById('root');
      const iframeContainer = document.querySelector('[class*="iframeContainer"]');
      if (!body || !html) return { value: 0, metrics: {} };

      const appNode = root && root.firstElementChild ? root.firstElementChild : root;

      let maxBottom = 0;
      const elements = appNode ? appNode.children : body.children;
      for (let i = 0; i < elements.length; i += 1) {
        const rect = elements[i].getBoundingClientRect();
        const bottom = rect.bottom + window.scrollY;
        if (bottom > maxBottom) maxBottom = bottom;
      }

      const metrics = {
        appRectHeight: appNode ? Math.ceil(appNode.getBoundingClientRect().height) : 0,
        appScrollHeight: appNode ? appNode.scrollHeight : 0,
        appOffsetHeight: appNode ? appNode.offsetHeight : 0,
        rootRectHeight: root ? Math.ceil(root.getBoundingClientRect().height) : 0,
        iframeContainerRectHeight: iframeContainer
          ? Math.ceil(iframeContainer.getBoundingClientRect().height)
          : 0,
        bodyScrollHeight: body.scrollHeight,
        bodyOffsetHeight: body.offsetHeight,
        htmlScrollHeight: html.scrollHeight,
        htmlOffsetHeight: html.offsetHeight,
        bodyChildrenBottom: Math.ceil(maxBottom),
        pathname: window.location.pathname,
      };

      // Prefer app-level measurements; use body/html metrics as fallback only.
      const value = Math.ceil(
        Math.max(
          metrics.appRectHeight,
          metrics.appScrollHeight,
          metrics.appOffsetHeight,
          metrics.rootRectHeight,
          metrics.iframeContainerRectHeight,
          metrics.bodyChildrenBottom,
          Math.min(metrics.bodyScrollHeight, metrics.appScrollHeight || metrics.bodyScrollHeight),
          Math.min(metrics.htmlScrollHeight, metrics.appScrollHeight || metrics.htmlScrollHeight),
          Math.min(metrics.bodyOffsetHeight, metrics.appOffsetHeight || metrics.bodyOffsetHeight),
          Math.min(metrics.htmlOffsetHeight, metrics.appOffsetHeight || metrics.htmlOffsetHeight)
        )
      );

      return { value, metrics };
    };

    const postHeight = () => {
      const measurement = getContentHeight();
      const nextHeight = measurement.value;

      if (!nextHeight || nextHeight === lastHeight) return;
      lastHeight = nextHeight;

      console.log(HEIGHT_DEBUG_PREFIX, 'posting height', {
        nextHeight,
        ...measurement.metrics,
      });

      window.parent.postMessage(
        {
          type: 'solar-optly-height',
          height: nextHeight,
          path: window.location.pathname,
        },
        '*'
      );
    };

    const schedulePost = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(postHeight);
    };

    const handleParentMessage = (event) => {
      const payload = event.data;
      if (!payload || payload.type !== 'solar-optly-height-request') return;
      console.log(HEIGHT_DEBUG_PREFIX, 'height request received');
      schedulePost();
    };

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(schedulePost);
      if (document.body) resizeObserver.observe(document.body);
      if (document.documentElement) resizeObserver.observe(document.documentElement);
    }

    if (typeof MutationObserver !== 'undefined' && document.body) {
      mutationObserver = new MutationObserver(schedulePost);
      mutationObserver.observe(document.body, {
        subtree: true,
        childList: true,
      });
    }

    window.addEventListener('load', schedulePost);
    window.addEventListener('resize', schedulePost);
    window.addEventListener('message', handleParentMessage);
    timeoutIds.push(window.setTimeout(postHeight, 150));
    timeoutIds.push(window.setTimeout(postHeight, 600));
    postHeight();

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      timeoutIds.forEach((id) => window.clearTimeout(id));
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      window.removeEventListener('load', schedulePost);
      window.removeEventListener('resize', schedulePost);
      window.removeEventListener('message', handleParentMessage);
    };
  }, [location.pathname]);

  return null;
}

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
      <IframeAutoHeightBridge />
      <BookingProvider>
        <PrefillBridge />
        <InactivityProvider>
          <QueryPrefillBridge />
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
