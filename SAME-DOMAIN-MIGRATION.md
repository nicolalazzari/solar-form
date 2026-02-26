# Same-Domain Migration Guide

When the solar-form app moves from Vercel (`solar-form-optly-def.vercel.app`) to the same domain as the main MVF page (e.g. `theecexperts.co.uk/solar-form/`), several workarounds currently in place can be removed or simplified. The cross-origin iframe is the root cause of most Safari issues.

## What Changes

### 1. `sessionStorage` will work natively

**Current state:** Safari blocks `sessionStorage` in third-party (cross-origin) iframes. We use `window.name` as a fallback.

**After migration:** The iframe and parent share the same origin, so `sessionStorage` works normally.

**Action:** Remove the `window.name` fallback from `BookingContext.jsx`. Keep `sessionStorage` persistence only.

```
File: src/contexts/BookingContext.jsx
- Remove window.name read/write in loadPersistedState() and persistState()
- Keep sessionStorage logic as-is
```

### 2. React Router state fallback no longer needed

**Current state:** We pass coordinates via `navigate(..., { state })` and read from `location.state` as a fallback because React context state could be lost in cross-origin iframes.

**After migration:** Same-origin iframes don't have the state loss issue. React context works normally across route changes.

**Action:** Remove the Router state fallback.

```
File: src/pages/AddressPage.jsx
- Remove the state parameter from navigate()
- Revert to: navigate({ pathname: '/solar-assessment', search: location.search })

File: src/pages/SolarAssessmentPage.jsx
- Remove useLocation() import and routeState logic
- Remove routeState.latitude / routeState.longitude fallbacks
- Simplify useEffect to: useEffect(() => { fetchSolarAssessment(); }, [])
- Remove the 5-second timeout fallback
- Remove hasFetched ref
- Keep the null guard inside fetchSolarAssessment() as a safety net
```

### 3. `postMessage` height sync becomes optional

**Current state:** The iframe child sends `solar-optly-height` messages to the parent so the parent can resize the iframe dynamically (cross-origin iframes can't be measured from outside).

**After migration:** Same-origin iframes allow the parent to directly access `iframe.contentDocument` and measure content height.

**Action:** You can either:
- **Keep postMessage** (simpler, no code change) -- it works same-origin too.
- **Switch to direct measurement** -- parent reads `iframe.contentDocument.body.scrollHeight` on an interval or via `ResizeObserver`. Remove `IframeAutoHeightBridge` from `App.jsx` and the height listener in `optimizely.js`.

Recommendation: keep `postMessage` for now unless there's a specific reason to change.

### 4. `Content-Security-Policy` header can be tightened

**Current state:** `vercel.json` sets `frame-ancestors *` to allow embedding from any origin.

**After migration:** Restrict to the actual parent domain.

```
File: vercel.json (or equivalent server config)
- Change: "frame-ancestors *"
- To:     "frame-ancestors 'self' https://theecexperts.co.uk https://*.theecexperts.co.uk"
```

### 5. Vite build target can be relaxed

**Current state:** We target `safari13` for maximum compatibility with cross-origin iframe quirks.

**After migration:** Same-origin removes most Safari edge cases. You can target `safari14` or the Vite default.

```
File: vite.config.js
- build.target: can revert to default or set ['es2020', 'safari14']
```

### 6. dataLayer polling may be unnecessary

**Current state:** `optimizely.js` polls `dataLayer` every 500 ms and re-wraps `push` in case GTM overwrites it. This was needed because Safari's different script execution timing caused the hook to be lost.

**After migration:** If the solar-form is served from the same domain, Optimizely's experiment activation is more reliable (no ITP cookie blocking). The one-time hook should be sufficient.

**Action:** You can simplify `attachDataLayerHook()` in `optimizely.js`:
- Remove the polling interval (`__solarOptlyDataLayerPolling`)
- Remove `replayDataLayerEvents()` and `wrapPush()` as separate functions
- Revert to the original single-hook approach

However, **keeping the polling is harmless** and provides extra resilience. Only remove if you want cleaner code.

### 7. `PrefillBridge` postMessage can use a specific origin

**Current state:** `PrefillBridge.jsx` sends and receives `postMessage` with `'*'` as the target origin.

**After migration:** Use the specific origin for security.

```
File: src/components/PrefillBridge.jsx
- Change: window.parent.postMessage({ type: 'solar-optly-prefill-request' }, '*')
- To:     window.parent.postMessage({ type: 'solar-optly-prefill-request' }, 'https://theecexperts.co.uk')

- Add origin check in handleMessage:
  if (event.origin !== 'https://theecexperts.co.uk') return;
```

Same change for the loader-complete message in `LoaderTransitionPage.jsx`.

### 8. Debug logging can be removed

**Current state:** Console logs with `[BookingContext]`, `[AddressPage]`, `[SolarAssessment]` prefixes were added to diagnose Safari issues.

**After migration:** Remove them once you're confident everything works.

```
Files: BookingContext.jsx, AddressPage.jsx, SolarAssessmentPage.jsx
- Remove all console.log/console.warn lines with these prefixes
```

## Summary Checklist

| # | Task | Priority | Files |
|---|------|----------|-------|
| 1 | Remove `window.name` fallback | High | `BookingContext.jsx` |
| 2 | Remove Router state coord fallback | High | `AddressPage.jsx`, `SolarAssessmentPage.jsx` |
| 3 | Tighten `frame-ancestors` CSP | Medium | `vercel.json` / server config |
| 4 | Tighten `postMessage` origins | Medium | `PrefillBridge.jsx`, `LoaderTransitionPage.jsx`, `optimizely.js` |
| 5 | Remove debug logging | Low | `BookingContext.jsx`, `AddressPage.jsx`, `SolarAssessmentPage.jsx` |
| 6 | Simplify dataLayer polling | Low | `optimizely.js` |
| 7 | Relax build target | Low | `vite.config.js` |
| 8 | Consider direct iframe measurement | Optional | `App.jsx`, `optimizely.js` |
