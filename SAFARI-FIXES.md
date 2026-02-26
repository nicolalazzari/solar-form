# Safari Compatibility Fixes

This document summarises all changes made to support Safari (including private browsing mode) when the solar-form runs inside a cross-origin iframe injected by Optimizely on the MVF Thank You Page.

## Problem

The solar form worked correctly on Chrome but failed on Safari in two ways:

1. **The form never loaded** -- the original TYP kept showing even when the user's answers matched the eligibility logic.
2. **Once loaded, the Solar Assessment page crashed** -- the Google Solar API was called with `null` coordinates, or the loading spinner hung indefinitely.

## Root Causes

| # | Root Cause | Safari Behaviour |
|---|-----------|-----------------|
| 1 | GTM overwrites `dataLayer.push` after our hook is attached; timing differs on Safari | Eligibility events silently missed → iframe never swapped |
| 2 | CSS `inset` shorthand not supported in Safari < 14.1 | Swap overlay didn't position correctly |
| 3 | Child iframe never sent `solar-optly-loader-complete` postMessage | Parent relied on fallback timers for reveal, with inconsistent timing on Safari |
| 4 | React context state lost between route changes in cross-origin iframes | `bookingData.latitude` / `longitude` were `null` on the SolarAssessmentPage |
| 5 | Safari blocks `sessionStorage` in third-party (cross-origin) iframes | First persistence fix had no effect on Safari |

## Changes

### 1. `optimizely.js` -- dataLayer hook resilience

**Problem:** The script hooked `dataLayer.push` once, but GTM can replace it at any time. On Safari, this happened before the form submission events fired.

**Fix:**
- Wrapped `push` with a tagged function (`__solarOptlyWrapped`) to detect if it gets overwritten.
- Added a 500 ms polling loop that re-wraps `push` and re-scans `dataLayer` for unprocessed events.
- Tracks processed event indexes to avoid double-processing.
- Stops polling after eligibility match or 2 minutes.

### 2. `optimizely.js` -- CSS `inset` replaced with explicit properties

**Problem:** `overlay.style.inset = '0'` is not supported in Safari < 14.1.

**Fix:** Replaced with explicit `top`, `right`, `bottom`, `left` assignments.

### 3. `src/pages/LoaderTransitionPage.jsx` -- send `solar-optly-loader-complete`

**Problem:** The parent page listened for a `solar-optly-loader-complete` postMessage to reveal the iframe and show surrounding page sections, but the child never sent it.

**Fix:** Added `window.parent.postMessage({ type: 'solar-optly-loader-complete' }, '*')` when the loader animation finishes, just before navigating to `/`.

### 4. `vite.config.js` -- explicit build target

**Problem:** Default Vite 5 target is Safari 14. Older versions could fail silently.

**Fix:** Set `build.target` to `['es2020', 'chrome87', 'firefox78', 'safari13', 'edge88']`.

### 5. `src/contexts/BookingContext.jsx` -- state persistence with `window.name` fallback

**Problem:** Safari blocks `sessionStorage` in third-party iframes (ITP). In-memory React context was the only state store, and it was lost between route changes in cross-origin iframes.

**Fix:**
- On every state change, booking data is written to both `sessionStorage` (works on Chrome) and `window.name` (works on Safari -- not affected by ITP).
- On mount, state is restored from `sessionStorage` first, then `window.name` as fallback.
- All storage access wrapped in `try/catch`.

### 6. `src/pages/AddressPage.jsx` + `src/pages/SolarAssessmentPage.jsx` -- Router state for coordinates

**Problem:** Even with persistence, React's state batching could leave `bookingData.latitude` as `null` on the first render of the SolarAssessmentPage in Safari.

**Fix:**
- AddressPage passes `{ latitude, longitude, postcode, fullAddress }` via React Router's `navigate(..., { state })`.
- SolarAssessmentPage reads `location.state` as an immediate fallback: `bookingData.latitude ?? routeState.latitude`.
- A 5-second timeout prevents an infinite loading spinner if coordinates never arrive.

## Files Changed

| File | What Changed |
|------|-------------|
| `optimizely.js` | dataLayer polling + re-hook; `style.inset` → explicit props |
| `src/pages/LoaderTransitionPage.jsx` | Send `solar-optly-loader-complete` postMessage |
| `vite.config.js` | Explicit `build.target` including `safari13` |
| `src/contexts/BookingContext.jsx` | `window.name` fallback persistence; debug logs |
| `src/pages/AddressPage.jsx` | Pass coords via Router state; debug logs |
| `src/pages/SolarAssessmentPage.jsx` | Read coords from Router state fallback; 5s timeout; debug logs |

## Commits

```
9b17713 Fix Safari compatibility: dataLayer hook resilience, inset fallback, loader postMessage
9f94ef4 Fix Safari null coordinates: wait for lat/lng before calling Solar API
6defbb2 Fix infinite loader on Safari: pass coords explicitly, add 5s fallback
f62243b Persist booking state to sessionStorage for Safari iframe resilience
30472ea Add debug logging for Safari state loss diagnosis
b1a8888 Fix Safari third-party iframe: window.name fallback + Router state coords
```

## Debug Logging

Console log prefixes added for ongoing diagnosis (filter in DevTools):

- `[BookingContext]` -- state persistence load/save, address data, update calls
- `[AddressPage]` -- handleContinue with coordinates and navigation
- `[SolarAssessment]` -- useEffect with context vs Router state comparison
