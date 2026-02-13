# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Project Name:** Solar Appointments Form Journey

**Purpose:** Online appointment booking system for solar panel installations with Project Solar. Users complete a Chameleon form, then are redirected to this iframe-based journey to check solar eligibility and book appointments directly, reducing call center costs.

**Business Value:** Reduce Project Solar's call center costs while improving appointment booking rates and charging premium for the service.

## Technical Stack

| Component | Technology |
|-----------|------------|
| Framework | Chameleon (PHP + React) |
| Deployment | Hosted in iframe on MVF landing pages |
| Font | "Be Vietnam Pro" |
| Styling | Modern, rounded corners, shadow effects |

## Co-Branding

This is a co-branded experience between **The Eco Experts** and **Project Solar UK**.

### Logos

| Brand | Logo URL |
|-------|----------|
| The Eco Experts | `https://images-ulpn.ecs.prd9.eu-west-1.mvfglobal.net/mp/wp-content/uploads/sites/3/2023/09/The-Eco-Experts_Brand-Logo-Blue.svg` |
| Project Solar | `https://images-ulpn.ecs.prd9.eu-west-1.mvfglobal.net/wp-content/uploads/2025/10/Project-Solar-long-full-colour-without-tag.svg` |

## Color Palette (Project Solar Brand)

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Green | `#03624C` | Buttons, primary actions, links, focus states |
| Primary Green Hover | `#024a3a` | Button hover state, link hover |
| Soft Background Green | `#DAE7E6` | Section backgrounds, selected states, info cards |
| Accent Plum | `#62033E` | Secondary accents |
| Light Green Accent | `#9ECBA7` | Progress indicators, highlights |
| Background | `#FFFFFF` | Main background, cards |
| Primary Text | `#000000` | Main text, titles |
| Secondary Text | `#4F4F4F` | Secondary text, labels, descriptions |
| Disabled Background | `rgba(237, 237, 237, 1)` | Disabled buttons, borders |
| Border Color | `#DAE7E6` | Card borders, dividers |

## Styling Rules

### Typography

| Element | Font Size | Font Weight | Color |
|---------|-----------|-------------|-------|
| Page Title | `1.5rem` | `700` | `#000000` |
| Section Title | `1.25rem` | `600` | `#000000` |
| Body Text | `0.875rem` | `400` | `#4F4F4F` |
| Labels | `0.875rem` | `500` | `#000000` |
| Helper Text | `0.75rem` | `400` | `#4F4F4F` |

### Buttons

**Primary Button:**
```css
background-color: #03624C;
color: #ffffff;
border: none;
border-radius: 8px;
font-size: 1rem;
font-weight: 600;
padding: 1rem;
```
- Hover: `background-color: #024a3a`
- Disabled: `background-color: rgba(237, 237, 237, 1)`, `color: #4F4F4F`

**Secondary Button:**
```css
background-color: transparent;
color: #4F4F4F;
border: 1px solid #DAE7E6;
border-radius: 8px;
```
- Hover: `border-color: #03624C`, `color: #03624C`

### Form Elements

**Input Fields:**
```css
border: 1px solid rgba(237, 237, 237, 1);
border-radius: 8px;
padding: 0.875rem 1rem;
```
- Focus: `border-color: #03624C`

**Selection Cards (slots, answers):**
```css
border: 2px solid rgba(237, 237, 237, 1);
border-radius: 8px;
```
- Hover: `border-color: #03624C`
- Selected: `border-color: #03624C`, `background-color: #DAE7E6`

### Cards & Containers

**Standard Card:**
```css
background-color: #FFFFFF;
border: 1px solid #DAE7E6;
border-radius: 16px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
```

**Info/Summary Card:**
```css
background-color: #DAE7E6;
border-radius: 12px;
padding: 1.25rem;
```

**Solar Potential Card (Dark):**
```css
background-color: #0a2540;
border-radius: 12px;
padding: 1.25rem;
```
- Grid items: `background-color: #1a3a5c`, `border-radius: 10px`
- Icon color: `#4dabf7`
- Value text: `#ffffff`, `font-weight: 700`
- Label text: `#a0aec0`

### Links

```css
color: #03624C;
text-decoration: underline;
```
- Hover: `color: #024a3a`

### Loading Spinner

```css
border: 4px solid rgba(237, 237, 237, 1);
border-top-color: #03624C;
border-radius: 50%;
```

## Callback Phone Number

When users decline online booking: **0800 112 3110**

## Key Integrations

### Google Cloud APIs

- **Google Geocoding API** - Convert addresses to coordinates
- **Google Places Autocomplete API** - Address suggestions
- **Google Place Details API** - Complete address information
- **Google Solar API** - Roof solar potential assessment

### Internal Systems

- **MVF Data Layer** - Receives: firstName, lastName, postcode, phoneNumber, emailAddress
- **Team Rhino Service** - Interface between this app and Lead platform
- **Team Gold** - Responsible for Chameleon forms and data layer population

### External Services

- **Ideal Postcodes API** - UK postcode-based address lookup (https://ideal-postcodes.co.uk/)
  - Documentation: https://docs.ideal-postcodes.co.uk/docs/guides
  - Reference implementation: https://bitbucket.org/mvfglobal/calculator-v2
- **Project Solar Booking APIs** - Poll available appointments, confirm bookings
- **Google Sheets** - Logging and reporting

## Application Flow

### Entry Point

User completes Chameleon form → Redirected to iframe page → Data layer populated with:
- firstName
- lastName
- postcode
- phoneNumber
- emailAddress
- Submission ID

### User Journey Flow

```
/loader (Entry Point)
├── Animated loader screen (4-6 seconds)
├── 3 states: "Checking answers" → "Matching installer" → "You're eligible"
├── Brand handover animation: The Eco Experts → Project Solar
└── Auto-transition → / (Index)
│
/ (Index)
├── Co-branded Thank You page
├── Headline: "You've been matched with Project Solar UK"
│   └── "Would you like to book an appointment online?"
│       ├── "Yes, book online" → /address
│       └── "No thank you" → Callback confirmation (phone: 0800 112 3110)
├── Trust Section: "Why 50,000+ UK homes trust Project Solar"
└── "What Happens Next?" 3-step section
│
/address (Step 1)
├── Postcode input + "Find address" button
├── Ideal Postcodes API lookup → Address dropdown
├── Address selection (includes lat/long from API)
└── Continue → /solar-assessment
│
/solar-assessment (Step 2)
├── Google Solar API Assessment
├── Est. Annual Savings Header (calculated from segments)
├── Satellite Map with Numbered Circle Markers
├── "Not your property?" link
├── Imagery Age Warning (always shown, Yes ends journey)
├── Estimated Solar Potential Card (6 stats)
├── Qualification Logic (panel counts, orientation)
└── Continue → /eligibility-questions
│
/eligibility-questions (Step 3)
├── Age Check (over 75?)
├── Roof Works Planned?
├── Income Check (over £15k?)
├── Credit Check Likelihood?
└── Continue → /slot-selection
│
/slot-selection (Step 4)
├── Project Solar API for Available Slots (Supabase Edge Function)
├── Slots grouped by date (list view)
├── Slot Selection
└── Confirm → /confirmation
│
/confirmation (Step 5)
├── Booking Confirmed (with .ics download)
├── OR Callback Required Message
└── Session Expired Message
```

## Data Architecture

### A. React Context (BookingContext)

- All user data stored in-memory during session
- Session ID generated on "Yes, book online" click
- Journey start time tracking
- Last action tracking for analytics

### B. Google Sheets Persistence

- **Sheet1 (Main Leads):** 38-column schema with all lead data
- **Interactions Tab:** 14-column event log for terminal events

### C. Data Flow Triggers

| Trigger | Purpose |
|---------|---------|
| `submit-booking` | Successful bookings, disqualifications, session expiry |
| `log-exit` | Browser close, tab hidden (abandoned journeys) |
| `log-interaction` | Terminal events only (not intermediate actions) |

## API Integrations

| API | Purpose | Call Method |
|-----|---------|-------------|
| Ideal Postcodes | UK postcode → addresses with lat/long | Direct frontend call |
| Google Solar API | Roof assessment, satellite imagery | Direct frontend call |
| Project Solar | Available booking slots | Supabase Edge Function (`booking-slots`) |
| Google Sheets | Data persistence | Supabase Edge Functions (`submit-booking`, `log-exit`, `log-interaction`) |

### Google Solar API Details

The Solar API is called directly from the frontend at:
```
https://solar.googleapis.com/v1/buildingInsights:findClosest
```

**Required Parameters:**
- `location.latitude` - Property latitude from Ideal Postcodes
- `location.longitude` - Property longitude from Ideal Postcodes
- `requiredQuality=MEDIUM` - **Critical:** Without this parameter, many UK locations return 404
- `key` - Google Maps API key (must have Solar API enabled)

**API Key Configuration (Google Cloud Console):**
- Enable "Solar API" in APIs & Services
- Under Credentials → API Key → Application restrictions:
  - Add allowed referrers: `http://localhost:*`, production domain
- The API key is exposed in frontend code (normal for Maps/Solar APIs)

### Ideal Postcodes API Details

Called directly from frontend at:
```
https://api.ideal-postcodes.co.uk/v1/postcodes/{postcode}?api_key={key}
```

**Response includes:** `latitude`, `longitude`, `line_1`, `line_2`, `post_town`, `county`, `postcode`

## Qualification Logic

### Solar Assessment Qualification

- Whole roof area ≥ 10m²
- At least one non-north facing segment with pitch ≥ 15°
- Panel requirements (one of):
  - **Option A:** 6+ panels on 1 non-north segment
  - **Option B:** 4+ panels across 2 segments (max 1 north)
  - **Option C:** 3+ panels across 3 segments (max 1 north)
- Minimum energy: 1,200 kWh/year

### Eligibility Disqualifiers

| Question | Disqualifying Answer |
|----------|---------------------|
| Over 75 years old | Yes |
| Roof works planned | Yes |
| Income over £15k | No |
| Likely to pass credit check | No |

### Initial Form Disqualifiers

- Not homeowner
- Already has solar system
- Business property

## Session Management

### Inactivity Tracking

- 30 second inactivity timer (non-landing pages)
- 60 second countdown modal
- Session expiry → callback required status

### Browser Close Detection

- `visibilitychange` event → `tab_hidden`
- `beforeunload` event → `browser_closed`
- Uses `sendBeacon` for reliable delivery

## Component Architecture

### Page Architecture (Demo Mode)

The application uses a **persistent demo page layout** where the booking journey renders inside an iframe-like container. This allows the full landing page design to remain visible throughout the journey for demonstration purposes.

```
┌─────────────────────────────────────────────────────┐
│  Co-branded Header (The Eco Experts + Project Solar) │
├─────────────────────────────────────────────────────┤
│  "You've been matched with Project Solar UK"        │
│  (Confirmation message - always visible)            │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐  │
│  │  IFRAME CONTENT                               │  │
│  │  ─────────────────────────────────────────    │  │
│  │  This is where the booking journey renders:   │  │
│  │  - IndexPage: Initial booking prompt          │  │
│  │  - AddressPage: Address lookup                │  │
│  │  - SolarAssessmentPage: Roof analysis         │  │
│  │  - EligibilityQuestionsPage: Qualification    │  │
│  │  - SlotSelectionPage: Appointment picker      │  │
│  │  - ConfirmationPage: Booking confirmed        │  │
│  └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  Trust Section: "Why 50,000+ UK homes trust..."     │
├─────────────────────────────────────────────────────┤
│  "What happens next?" 3-step cards                  │
├─────────────────────────────────────────────────────┤
│  Footer (Privacy Policy, Terms of Use)              │
└─────────────────────────────────────────────────────┘
```

**Key Components:**

| Component | Purpose |
|-----------|---------|
| `DemoPageLayout` | Persistent wrapper with header, trust section, what happens next, footer |
| `BookingLayout` | Handles progress indicator and back button for journey steps |
| `IndexPage` | Initial booking prompt modal content |
| Journey Pages | Address, Solar Assessment, Eligibility, Slot Selection, Confirmation |

**Production vs Demo:**
- In production, only the modal content (BookingLayout + journey pages) would be embedded as an iframe
- The DemoPageLayout shows the full context for demonstration/UAT purposes
- The modal container has a clean card style with shadow to indicate the iframe area

### Layout Components

- **DemoPageLayout:** Persistent page wrapper (header, confirmation, trust section, what happens next, footer)
- **BookingLayout:** Progress bar, back button for journey steps (renders inside iframe area)
- **ProgressIndicator:** Step X of Y with percentage

### Form Components

- **PostcodeAddressDropdown:** Address lookup dropdown
- **RoofSegmentMap:** Satellite imagery with numbered circle markers (no polygon overlays)
- **ImageryAgeWarning:** Inline warning bar with Yes/No buttons for roof change confirmation

### Solar Assessment Page Layout

The Solar Assessment page follows this specific layout order:

1. **Title & Description** - "Your roof assessment" with segment selection instructions
2. **Est. Annual Savings Header** - Green card showing calculated savings with info tooltip
3. **Satellite Map** - Google Maps satellite view with numbered circle markers for each segment
4. **Property Link** - "Not your property? Click here to select on map"
5. **Imagery Warning** - Always visible until answered. If "Yes" (roof changed), journey ends
6. **Estimated Solar Potential Card** - Dark navy card with 6 stats in a 3x2 grid:
   - Suitable Faces (count of segments)
   - Max Panels (total panel count)
   - Usable Roof Area (m²)
   - Avg Sun Hrs/Yr
   - System Capacity (kW)
   - kWh/Year Output
7. **Continue Button** - Enabled when at least one segment is selected

**Segment Selection:**
- All segments are auto-selected by default
- Users can toggle segments by clicking the numbered markers
- Savings and potential stats update dynamically based on selection

**Savings Calculation:**
- Based on 50% self-consumption at £0.24/kWh electricity rate
- Plus Smart Export Guarantee earnings at £0.05/kWh for exported energy

### Context Providers

- **BookingProvider:** All booking data state
- **InactivityProvider:** Session timeout handling

## Thank You Page Sections

### Trust Section: "Why 50,000+ UK homes trust Project Solar"

Display 3-4 benefit points with icons:
1. 50,000+ installs across the UK
2. Average household savings highlighted
3. Lifetime panel guarantee & aftercare
4. HIES & FCA regulated for peace of mind

### "What Happens Next?" Section

3-step horizontal layout:

| Step | Title | Description |
|------|-------|-------------|
| 1 | Expert call | Confirm your details, answer questions on savings & finance |
| 2 | Free home assessment | Tailored system design, no obligation quote |
| 3 | Installation | Typically completed in 3–4 weeks, full setup & aftercare |

### Loader Page States (4-6 seconds total)

| Time | Headline | Supporting Text |
|------|----------|-----------------|
| 0-2s | "Checking your answers…" | "We're reviewing your property details." |
| 2-4s | "Matching you with a trusted solar installer" | "We only work with vetted UK installers." |
| 4-6s | "You're eligible for solar panels" | "Connecting you with Project Solar UK…" |

Trust signals displayed below loader:
- Trusted by thousands of UK homeowners
- FCA & HIES regulated installers
- No obligation, free consultation

## Edge Functions Summary

**Note:** Address lookup and solar assessment are now called directly from the frontend (not via edge functions).

| Function | Trigger | Output |
|----------|---------|--------|
| `booking-slots` | Eligibility passed | Available time slots |
| `submit-booking` | Booking/disqualification | Sheet1 row + booking reference |
| `log-interaction` | Terminal events | Interactions tab row |
| `log-exit` | Browser close/tab hidden | Sheet1 + Interactions rows |

### Direct API Calls (Frontend)

| API | Trigger | Output |
|-----|---------|--------|
| Ideal Postcodes | Postcode entry + "Find address" click | Address list with lat/long |
| Google Solar API | Address confirmed → Solar Assessment page load | Roof segments, panel counts, imagery |

## Environment Variables

### Frontend (.env)

| Variable | Purpose |
|----------|---------|
| `VITE_GOOGLE_MAPS_API_KEY` | Google Solar API (direct frontend call) |
| `VITE_IDEAL_POSTCODES_API_KEY` | Ideal Postcodes API (direct frontend call) |
| `VITE_GOOGLE_SHEET_ID` | Google Sheet ID (for reference) |
| `VITE_PROJECT_SOLAR_API_URL` | Supabase Edge Functions base URL |

### Backend (Supabase Edge Functions)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_SHEETS_CREDENTIALS` | Service account JSON for Google Sheets |
| `GOOGLE_SHEET_ID` | Target spreadsheet ID |

## Google Sheets Schema (39 Columns)

Detailed column-by-column specification for Sheet1:

1. Submission Timestamp
2. First Name
3. Last Name
4. Email
5. Phone
6. Postcode
7. Full Address
8. Project Solar Booking ID
9. Homeowner
10. Roof Space ≥10m²
11. Solar Roof Area
12. Sun Exposure Hours/Year
13. Already Have Solar
14. Aged over 75
15. Conservation/Listed
16. Roof Works Planned
17. Income >£15K
18. Appointment Within 5 Days
19. Likely to pass credit check
20. Lead Status
21. Property Type
22. Bedrooms
23. Property Usage
24. Session ID
25. Current Page
26. Action
27. Journey Status
28. Time on Page (s)
29. Total Journey Time (s)
30. Last Action
31. Last Action Page
32. Total Panel Count
33. Total Estimated Energy
34. Estimated Annual Savings
35. Imagery Quality
36. Imagery Date
37. Selected Segments Count
38. Carbon Offset (kg/year)
39. Submission ID

## Commands

<!-- Add common commands here, e.g.: -->
<!-- - `npm install` - Install dependencies -->
<!-- - `npm run dev` - Start development server -->
<!-- - `npm test` - Run tests -->

## Guidelines

- Follow existing code style and conventions
- Write clear, descriptive commit messages
- Test changes before committing
- **Update TODO.md after completing each feature** - Keep track of planned work, in-progress items, and completed tasks
