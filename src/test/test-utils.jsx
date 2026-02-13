import { render } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { BookingProvider, InactivityProvider } from '../contexts';

/**
 * Custom render function that wraps components with all required providers
 */
function customRender(ui, options = {}) {
  const {
    route = '/',
    initialEntries = [route],
    ...renderOptions
  } = options;

  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <BookingProvider>
          <InactivityProvider>
            {children}
          </InactivityProvider>
        </BookingProvider>
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Render with just BookingProvider (no router or inactivity)
 */
function renderWithBookingContext(ui, options = {}) {
  function Wrapper({ children }) {
    return (
      <BookingProvider>
        {children}
      </BookingProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Render with BrowserRouter only
 */
function renderWithRouter(ui, options = {}) {
  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Mock API responses for testing
 */
const mockApiResponses = {
  addressLookup: {
    addresses: [
      { fullAddress: '1 Test Street, London, SW1A 1AA' },
      { fullAddress: '2 Test Street, London, SW1A 1AA' },
      { fullAddress: '3 Test Street, London, SW1A 1AA' },
    ],
  },

  geocode: {
    latitude: 51.5074,
    longitude: -0.1278,
  },

  solarAssessment: {
    imageryUrl: 'https://example.com/satellite.jpg',
    imageryDate: '2024-01-15',
    imageryQuality: 'high',
    totalRoofArea: 45,
    segments: [
      {
        azimuth: 180, // South facing
        pitch: 30,
        area: 20,
        panelCount: 8,
        estimatedEnergy: 2400,
        boundaryPoints: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
        imageWidth: 500,
      },
      {
        azimuth: 0, // North facing
        pitch: 30,
        area: 15,
        panelCount: 4,
        estimatedEnergy: 800,
        boundaryPoints: [{ x: 100, y: 0 }, { x: 200, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 100 }],
        imageWidth: 500,
      },
    ],
  },

  bookingSlots: {
    slots: [
      {
        id: 'slot-1',
        startTime: '2024-03-15T09:00:00Z',
        endTime: '2024-03-15T10:00:00Z',
      },
      {
        id: 'slot-2',
        startTime: '2024-03-15T10:00:00Z',
        endTime: '2024-03-15T11:00:00Z',
      },
      {
        id: 'slot-3',
        startTime: '2024-03-16T14:00:00Z',
        endTime: '2024-03-16T15:00:00Z',
      },
    ],
  },

  submitBooking: {
    bookingReference: 'PS-2024-001234',
    success: true,
  },
};

/**
 * Setup fetch mock with predefined responses
 */
function setupFetchMock(customResponses = {}) {
  const responses = { ...mockApiResponses, ...customResponses };

  global.fetch = vi.fn((url, options) => {
    const urlString = url.toString();

    if (urlString.includes('getaddress-lookup')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.addressLookup),
      });
    }

    if (urlString.includes('geocode')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.geocode),
      });
    }

    if (urlString.includes('solar-assessment')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.solarAssessment),
      });
    }

    if (urlString.includes('booking-slots')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.bookingSlots),
      });
    }

    if (urlString.includes('submit-booking')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.submitBooking),
      });
    }

    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    });
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Export custom utilities
export {
  customRender as render,
  renderWithBookingContext,
  renderWithRouter,
  mockApiResponses,
  setupFetchMock,
};
