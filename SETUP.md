# Solar Appointments Form Journey - Setup Guide

This guide will help a new developer get the Solar Appointments Form Journey application running locally and understand how to deploy it.

## Overview

**Project Name:** Solar Appointments Form Journey
**Purpose:** Online appointment booking system for solar panel installations with Project Solar
**Tech Stack:** React + Vite (frontend), Supabase Edge Functions (backend), Google Sheets (data persistence)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **Code editor** (VS Code recommended)

## Repository Access

The codebase is hosted on GitHub at: **https://github.com/mvf-tech/solar-form**

1. GitHub account with access to the mvf-tech organization
2. Clone the repository:
   ```bash
   git clone https://github.com/mvf-tech/solar-form.git
   cd solar-form
   ```

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18.3.1
- Vite 5.4.21
- React Router DOM 7.1.3
- Google Maps JavaScript API Loader

### 2. Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Google APIs (Frontend)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Ideal Postcodes (Frontend)
VITE_IDEAL_POSTCODES_API_KEY=your_ideal_postcodes_api_key_here

# Supabase (Frontend)
VITE_PROJECT_SOLAR_API_URL=https://wakypxxobpdvqwblheio.supabase.co/functions/v1
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Sheets (Reference)
VITE_GOOGLE_SHEET_ID=your_google_sheet_id_here
```

### 3. API Keys Needed

You'll need to obtain the following API keys from the project owner or set up new ones:

#### Google Cloud Platform APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use existing
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Solar API**
   - **Places API**
   - **Geocoding API**
4. Create credentials:
   - API Key for frontend (add to `VITE_GOOGLE_MAPS_API_KEY`)
   - Service Account for Sheets backend
5. For the frontend API key:
   - Go to Credentials → API Keys → Edit
   - Under "Application restrictions": Add allowed referrers
     - `http://localhost:*`
     - Your production domain
   - Under "API restrictions": Select "Restrict key"
     - Enable: Maps JavaScript API, Solar API, Places API, Geocoding API

#### Ideal Postcodes API

1. Sign up at [Ideal Postcodes](https://ideal-postcodes.co.uk/)
2. Get API key from dashboard
3. Add to `VITE_IDEAL_POSTCODES_API_KEY`

#### Supabase Configuration

1. The project uses Lovable Cloud for Supabase deployment
2. You'll need access to the Lovable project
3. Get the following from Supabase dashboard:
   - Project URL (already in .env)
   - Anon/Public key (add to `VITE_SUPABASE_ANON_KEY`)

#### Google Sheets

1. Create a Google Sheet with two tabs:
   - **Sheet1** - 39 columns (see schema below)
   - **Interactions** - 14 columns for event logging
2. Share the sheet with the service account email
3. Copy the Sheet ID from the URL and add to `VITE_GOOGLE_SHEET_ID`

### 4. Google Sheets Schema

**Sheet1 (Main Leads) - 39 Columns:**

| Column | Header | Type |
|--------|--------|------|
| A | Submission Timestamp | Datetime |
| B | First Name | Text |
| C | Last Name | Text |
| D | Email | Email |
| E | Phone | Phone |
| F | Postcode | Text |
| G | Full Address | Text |
| H | Project Solar Booking ID | Text |
| I | Homeowner | Yes/No |
| J | Roof Space ≥10m² | Yes/No |
| K | Solar Roof Area | Number |
| L | Sun Exposure Hours/Year | Number |
| M | Already Have Solar | Yes/No |
| N | Aged over 75 | Yes/No |
| O | Conservation/Listed | Yes/No |
| P | Roof Works Planned | Yes/No |
| Q | Income >£15K | Yes/No |
| R | Appointment Within 5 Days | Yes/No |
| S | Likely to pass credit check | Yes/No |
| T | Lead Status | Text |
| U | Property Type | Text |
| V | Bedrooms | Number |
| W | Property Usage | Text |
| X | Submission ID | Text |
| Y | Current Page | Text |
| Z | Action | Text |
| AA | Journey Status | Text |
| AB | Time on Page (s) | Number |
| AC | Total Journey Time (s) | Number |
| AD | Last Action | Text |
| AE | Last Action Page | Text |
| AF | Total Panel Count | Number |
| AG | Total Estimated Energy | Number |
| AH | Estimated Annual Savings | Number |
| AI | Imagery Quality | Text |
| AJ | Imagery Date | Date |
| AK | Selected Segments Count | Number |
| AL | Carbon Offset (kg/year) | Number |
| AM | Session ID | Text |

**Interactions Tab - 15 Columns:**

| Column | Header | Type |
|--------|--------|------|
| A | Timestamp | Datetime |
| B | Session ID | Text |
| C | First Name | Text |
| D | Last name | Text |
| E | Email | Email |
| F | Phone | Phone |
| G | Postcode | Text |
| H | Current Page | Text |
| I | Action | Text |
| J | Journey Status | Text |
| K | Time on Page | Number |
| L | Journey time | Number |
| M | Last Action | Text |
| N | Last Action Page | Text |
| O | Submission ID | Text |

## Running the Application

### Development Server

```bash
npm run dev
```

This starts Vite dev server on `http://localhost:3000`

**Dev Mode Features:**
- Hot Module Replacement (HMR)
- Test user data auto-populated (no Chameleon data layer needed)
- Default test data:
  - Name: Test User
  - Email: test@example.com
  - Phone: 07700900000

### Production Build

```bash
npm run build
```

Builds the app for production to the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

Preview the production build locally.

## Supabase Edge Functions

The backend uses Supabase Edge Functions (Deno runtime) deployed via Lovable Cloud.

### Edge Functions Overview

Located in `supabase/functions/`:

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `booking-slots` | `/booking-slots` | Fetch available appointment slots from Project Solar API |
| `submit-booking` | `/submit-booking` | Save booking confirmations to Google Sheets |
| `log-interaction` | `/log-interaction` | Log terminal events to Interactions tab |
| `log-exit` | `/log-exit` | Log browser close/tab hidden events |

### Shared Modules

Located in `supabase/functions/_shared/`:

- **cors.ts** - CORS headers configuration
- **google-sheets.ts** - Google Sheets API integration with JWT auth
- **schema.ts** - Column mapping functions for both Sheet1 and Interactions tabs

### Environment Variables for Edge Functions

These are set in the Lovable Cloud dashboard (not in `.env`):

```env
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
GOOGLE_SHEET_ID=your_google_sheet_id_here
```

### Deploying Edge Functions

The project uses **Lovable Cloud** for deployment. Steps:

1. Log into Lovable Cloud dashboard
2. Navigate to your project
3. Go to Edge Functions section
4. Click "Deploy" to push the latest code from `supabase/functions/`
5. Verify deployment in logs

**Important Notes:**
- Changes may take 1-2 minutes to propagate
- Always check logs after deployment to verify the new code is running
- Lovable may cache builds - multiple deployments may be needed

## Architecture & Key Files

### Frontend Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── BookingLayout.jsx          # Progress bar, back button wrapper
│   │   ├── DemoPageLayout.jsx         # Full page wrapper (demo mode)
│   │   └── ProgressIndicator.jsx      # Step X of Y indicator
│   └── PostcodeAddressDropdown.jsx    # Address lookup component
├── contexts/
│   ├── BookingContext.jsx             # Main booking state management
│   ├── InactivityContext.jsx          # Session timeout handling
│   └── index.js                       # Context exports
├── pages/
│   ├── AddressPage.jsx                # Step 1: Address input
│   ├── ConfirmationPage.jsx           # Step 5: Booking confirmed
│   ├── EligibilityQuestionsPage.jsx   # Step 3: Qualification questions
│   ├── IndexPage.jsx                  # Entry: "Book online" prompt
│   ├── LoaderPage.jsx                 # Entry: Brand transition animation
│   ├── SlotSelectionPage.jsx          # Step 4: Appointment time picker
│   └── SolarAssessmentPage.jsx        # Step 2: Roof analysis
├── config/
│   └── env.js                         # Environment variable exports
├── App.jsx                            # React Router setup
└── main.jsx                           # React app entry point
```

### Backend Structure

```
supabase/functions/
├── _shared/
│   ├── cors.ts                        # CORS configuration
│   ├── google-sheets.ts               # Sheets API client
│   └── schema.ts                      # Sheet1 & Interactions mapping
├── booking-slots/
│   └── index.ts                       # Fetch available appointment slots
├── submit-booking/
│   └── index.ts                       # Save booking to Sheets
├── log-interaction/
│   └── index.ts                       # Log terminal events
└── log-exit/
    └── index.ts                       # Log browser close events
```

### Critical Implementation Details

#### 1. Flat Payloads Required

**IMPORTANT:** Supabase Edge Functions cannot handle objects or arrays in the JSON payload when writing to Google Sheets.

❌ **Wrong:**
```javascript
const payload = {
  ...bookingData,  // Contains nested objects
  selectedSlot: { startTime: '...', endTime: '...' }  // Object
};
```

✅ **Correct:**
```javascript
const payload = {
  firstName: bookingData.firstName || '',
  lastName: bookingData.lastName || '',
  // ... all scalar fields explicitly mapped
  selectedSlotStart: bookingData.selectedSlot?.startTime || '',
  selectedSlotEnd: bookingData.selectedSlot?.endTime || '',
  // NO objects or arrays
};
```

#### 2. Nullish Value Handling

Use explicit null/undefined checks with String conversion for numeric fields:

❌ **Wrong:**
```javascript
carbonOffset: data.carbonOffset || '',  // Loses 0 values
solarRoofArea: data.solarRoofArea ?? '',  // May fail in deployed version
```

✅ **Correct:**
```javascript
carbonOffset: (data.carbonOffset !== null && data.carbonOffset !== undefined ? String(data.carbonOffset) : ''),
solarRoofArea: (data.solarRoofArea !== null && data.solarRoofArea !== undefined ? String(data.solarRoofArea) : ''),
```

#### 3. Boolean Handling

Send both boolean AND string versions for compatibility:

```javascript
// Frontend payload
{
  isOver75: false,                           // Boolean
  ageOver75: 'No',                          // String version
  roofWorksPlanned: true,                    // Boolean
  roofWorks: 'Yes',                         // String version
}

// Backend schema mapping
ageOver75: (data.ageOver75 && data.ageOver75 !== '' ? data.ageOver75 : boolToYesNo(data.isOver75))
```

#### 4. Field Aliases

Support multiple field name variants for backward compatibility:

```javascript
email: data.emailAddress || data.email || '',
phone: data.phoneNumber || data.phone || '',
address: data.fullAddress || data.address || '',
```

## Testing Checklist

After setup, verify the following works:

### Local Development Testing

1. **Start dev server** (`npm run dev`)
2. **Navigate to** `http://localhost:3000`
3. **Entry point** - LoaderPage animation (4-6 seconds)
4. **IndexPage** - Click "Yes, book online"
5. **AddressPage**:
   - Enter a UK postcode (e.g., "SW1A 1AA")
   - Click "Find address"
   - Select an address from dropdown
   - Verify latitude/longitude captured
6. **SolarAssessmentPage**:
   - Verify satellite map loads with circle markers
   - Check "Estimated Solar Potential" card shows 6 stats
   - Answer imagery age warning (click "No")
   - Click Continue
7. **EligibilityQuestionsPage**:
   - Answer all 4 questions (use "No", "No", "Yes", "Yes" to pass)
   - Click Continue
8. **SlotSelectionPage**:
   - Verify slots load from Project Solar API
   - Select a time slot
   - Click Confirm
9. **ConfirmationPage**:
   - Verify booking confirmation message
   - Check booking reference generated (format: `PS-YYYY-XXXXXX`)
   - Verify "Add to calendar" button works (.ics download)
10. **Google Sheet verification**:
    - Open Google Sheet
    - Verify new row in Sheet1 with all 39 columns populated
    - Verify "Test User" name and test contact details

### API Integration Testing

1. **Ideal Postcodes API** - Address lookup works
2. **Google Solar API** - Roof segments load with circle markers
3. **Project Solar Booking API** - Slots load correctly
4. **Google Sheets API** - Data writes successfully

### Edge Function Testing

Test each endpoint directly with curl:

```bash
# Test submit-booking
curl -X POST https://wakypxxobpdvqwblheio.supabase.co/functions/v1/submit-booking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "emailAddress": "test@example.com",
    "phoneNumber": "07700900000",
    "action": "booking_confirmed"
  }'
```

Expected response: `{"bookingReference":"PS-2026-XXXXXX","success":true}`

## Deployment to Production

### Frontend Deployment

The frontend is a static site that can be deployed to:
- **Vercel** (recommended)
- **Netlify**
- **AWS S3 + CloudFront**
- Any static hosting service

**Build command:** `npm run build`
**Output directory:** `dist/`

**Environment Variables:**
Add all `VITE_*` variables to your hosting provider's environment settings.

### Iframe Integration

In production, the booking journey is embedded as an iframe on MVF landing pages:

1. Build the app (`npm run build`)
2. Deploy to static hosting
3. Embed in landing page:
   ```html
   <iframe
     src="https://your-deployment-url.com"
     width="100%"
     height="800px"
     frameborder="0"
   ></iframe>
   ```

### Chameleon Data Layer

In production, the Chameleon form populates `window.dataLayer` with:

```javascript
window.dataLayer = {
  answers: {
    first_name: "John",
    last_name: "Doe",
    primary_address_postalcode: "SW1A1AA",
    phone_number: "07700900000",
    email_address: "john@example.com"
  },
  submissionId: "chameleon-submission-uuid"
};
```

This data is consumed by [IndexPage.jsx:19-33](src/pages/IndexPage.jsx#L19-L33).

## Troubleshooting

### Issue: 400 "Missing required contact information"

**Cause:** Edge function expects `email`/`phone` but frontend sends `emailAddress`/`phoneNumber`
**Fix:** Field aliases already implemented in [ConfirmationPage.jsx:59-64](src/pages/ConfirmationPage.jsx#L59-L64)

### Issue: White page on confirmation

**Cause:** Sending objects/arrays in payload breaks Sheets write
**Fix:** Use flat scalar-only payload (already implemented)

### Issue: Columns empty in Google Sheet

**Cause:** Zero values or nullish coalescing issues
**Fix:** Use explicit null/undefined checks with String conversion (already implemented in [schema.ts:70-98](supabase/functions/_shared/schema.ts#L70-L98))

### Issue: Edge function changes not appearing

**Cause:** Lovable Cloud deployment caching
**Solution:**
1. Check Lovable logs to verify which version is running
2. Redeploy multiple times if needed
3. Wait 1-2 minutes between tests

### Issue: Solar API returns 404

**Cause:** Missing `requiredQuality=MEDIUM` parameter
**Fix:** Already included in [SolarAssessmentPage.jsx](src/pages/SolarAssessmentPage.jsx)

### Issue: CORS errors

**Cause:** Missing origin in CORS configuration
**Fix:** Update [supabase/functions/_shared/cors.ts](supabase/functions/_shared/cors.ts)

## Security & Credentials

### Sensitive Files (Never Commit)

Add these to `.gitignore` (already configured):

- `.env` - Frontend environment variables
- `.env.local`
- `dist/` - Build output
- `node_modules/` - Dependencies

### Sharing Credentials Securely

**Do NOT share via:**
- Email
- Slack/Teams messages
- GitHub issues
- Version control

**Use instead:**
- 1Password shared vault
- LastPass team account
- Bitwarden organization
- Encrypted file transfer (GPG)

### Service Account JSON

The Google Sheets service account JSON should:
1. Never be committed to version control
2. Be stored in Lovable Cloud environment variables
3. Be shared via secure password manager only

## Support & Documentation

- **CLAUDE.md** - Comprehensive project overview and styling guide
- **TODO.md** - Feature roadmap and completed tasks
- **Package.json** - Dependencies and npm scripts
- **GitHub Issues** - Bug tracking and feature requests

## Contact

For questions about:
- **Chameleon forms & data layer** → Team Gold
- **Lead platform integration** → Team Rhino
- **Project Solar APIs** → Project Solar UK
- **This application** → Repository owner

## Next Steps

After completing setup:

1. ✅ Verify all API keys work
2. ✅ Run full booking flow end-to-end locally
3. ✅ Check Google Sheet receives data correctly
4. ✅ Test edge functions individually
5. ✅ Review CLAUDE.md for styling guidelines
6. ✅ Review TODO.md for planned features
7. ✅ Deploy to staging environment
8. ✅ Coordinate with Team Gold for Chameleon integration testing

---

**Last Updated:** 2026-02-16
**Created by:** Claude Code (Anthropic)
