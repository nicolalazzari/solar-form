# QA Testing Guide

This document outlines the QA process for the Solar Appointments Form Journey application.

## Quick Commands

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run full QA pipeline (lint + test + build)
npm run qa

# Run linting only
npm run lint
```

## Automated Test Coverage

### Unit Tests Location
- `src/test/contexts/` - Context provider tests
- `src/test/components/` - Component unit tests
- `src/test/pages/` - Page component tests

### What's Tested
- **BookingContext**: Session initialization, data updates, state management
- **ProgressIndicator**: Step display, percentage calculation, accessibility
- **IndexPage**: Rendering, navigation, user interactions
- **EligibilityQuestionsPage**: Question flow, qualification logic, navigation

## Manual QA Checklist

### Pre-Release Checklist

#### 1. Visual/UI Checks
- [ ] Logo displays correctly in header
- [ ] "Be Vietnam Pro" font loads properly
- [ ] Color palette matches spec (#0bad49 primary, #55bfe5 accent)
- [ ] Buttons have correct hover states
- [ ] Progress bar animates smoothly
- [ ] Responsive design works on mobile (375px+)
- [ ] Shadow effects visible on content cards
- [ ] Border radius consistent (16px cards, 8px buttons)

#### 2. User Journey Flow
- [ ] **Index Page**: "Yes, book online" navigates to /address
- [ ] **Index Page**: "No thank you" triggers callback required status
- [ ] **Address Page**: Postcode lookup returns addresses
- [ ] **Address Page**: Address selection enables Continue button
- [ ] **Solar Assessment**: Loading spinner appears during API call
- [ ] **Solar Assessment**: Segments are clickable and selectable
- [ ] **Solar Assessment**: Disqualification redirects to confirmation
- [ ] **Eligibility**: All 4 questions display sequentially
- [ ] **Eligibility**: Disqualifying answers lead to callback
- [ ] **Slot Selection**: Available slots display by date
- [ ] **Slot Selection**: Slot selection highlights correctly
- [ ] **Confirmation**: Booking reference displays
- [ ] **Confirmation**: "Add to calendar" downloads .ics file

#### 3. Business Logic Validation

##### Solar Assessment Qualification
- [ ] Roof area ≥ 10m² required
- [ ] Non-north facing segment with pitch ≥ 15° required
- [ ] Panel options validated:
  - Option A: 6+ panels on 1 non-north segment
  - Option B: 4+ panels across 2 segments (max 1 north)
  - Option C: 3+ panels across 3 segments (max 1 north)
- [ ] Minimum 1,200 kWh/year energy required

##### Eligibility Disqualifiers
- [ ] Over 75 years old = Yes → Disqualified
- [ ] Roof works planned = Yes → Disqualified
- [ ] Income over £15k = No → Disqualified
- [ ] Likely to pass credit check = No → Disqualified

#### 4. Session Management
- [ ] Session ID generated on "Yes, book online"
- [ ] Inactivity warning appears after 30 seconds
- [ ] 60 second countdown in warning modal
- [ ] Session expiry redirects to confirmation (callback)
- [ ] "Stay active" button resets timer
- [ ] Browser close triggers log-exit

#### 5. Navigation
- [ ] Back button appears on steps 2-4
- [ ] Back button hidden on step 1 and confirmation
- [ ] Browser back button works correctly
- [ ] Direct URL access handled properly

#### 6. Error Handling
- [ ] API failures show user-friendly error messages
- [ ] Retry buttons available on error states
- [ ] Form validation prevents invalid submissions

#### 7. Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] Focus states visible
- [ ] Screen reader announces progress
- [ ] Color contrast meets WCAG AA
- [ ] Form labels properly associated

## API Integration Tests

### Required Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/getaddress-lookup | GET | Postcode lookup |
| /api/geocode | POST | Address verification |
| /api/solar-assessment | POST | Roof analysis |
| /api/booking-slots | POST | Available appointments |
| /api/submit-booking | POST | Confirm booking |
| /api/log-exit | POST | Session exit logging |
| /api/log-interaction | POST | Event logging |

### Mock Data Available
Test utilities provide mock responses in `src/test/test-utils.jsx`:
- `mockApiResponses.addressLookup`
- `mockApiResponses.geocode`
- `mockApiResponses.solarAssessment`
- `mockApiResponses.bookingSlots`
- `mockApiResponses.submitBooking`

## Performance Checks
- [ ] Initial page load < 3 seconds
- [ ] Route transitions smooth
- [ ] No memory leaks on navigation
- [ ] Images optimized
- [ ] Bundle size reasonable (< 500KB gzipped)

## Browser Compatibility
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)
- [ ] iOS Safari
- [ ] Chrome for Android

## Regression Testing
After any code change, verify:
1. Run `npm run qa` passes
2. Manual smoke test of affected feature
3. No console errors in browser
4. Network requests completing successfully

## Reporting Issues
When reporting bugs, include:
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information
- Console errors (if any)
- Network tab screenshots (if API-related)
