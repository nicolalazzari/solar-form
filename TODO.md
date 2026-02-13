# TODO

## In Progress

## Backlog

- [ ] Set up Edge Functions for API endpoints
- [ ] Add form validation
- [ ] Connect to real APIs (GetAddress.io, Google Solar, Project Solar)
- [ ] Add more comprehensive test coverage

## Completed

- [x] Create GitHub repository
- [x] Initialize git locally
- [x] Create CLAUDE.md
- [x] Create TODO.md
- [x] Set up project structure (HTML)
- [x] Add headline to index.html
- [x] Add full project specification to CLAUDE.md
- [x] Create initial React component structure
  - [x] Context providers (BookingContext, InactivityContext)
  - [x] Layout components (BookingLayout, ProgressIndicator)
  - [x] Form components (PostcodeAddressDropdown, RoofSegmentMap, RoofSegmentSelection)
  - [x] Page components (Index, Address, SolarAssessment, EligibilityQuestions, SlotSelection, Confirmation)
  - [x] Common components (InactivityModal)
- [x] Set up Vite build configuration
- [x] Create package.json with dependencies
- [x] Install npm dependencies
- [x] Add Project Solar logo
- [x] Set up QA testing infrastructure
  - [x] Configure Vitest with React Testing Library
  - [x] Create test setup and utilities
  - [x] Write BookingContext tests
  - [x] Write IndexPage tests
  - [x] Write EligibilityQuestionsPage tests
  - [x] Write ProgressIndicator tests
  - [x] Create QA.md documentation
  - [x] Create QA agent skill
- [x] Configure environment variables
  - [x] Create .env.example template
  - [x] Create .gitignore
  - [x] Create config/env.js for accessing env vars
- [x] Enable UAT mode with mock data for all pages
- [x] Add enhanced solar assessment features
  - [x] Install @vis.gl/react-google-maps for Google Maps integration
  - [x] Create utility functions (orientation colours, panel calculations, imagery date)
  - [x] Update BookingContext with location/imagery state fields
  - [x] Create RoofFaceInfoOverlay component (tooltip/bottom sheet)
  - [x] Create PropertyMapSelector component (manual location correction modal)
  - [x] Create ImageryAgeWarning component (2+ year old imagery warning)
  - [x] Rewrite RoofSegmentMap with Google Maps satellite view and interactive polygons
  - [x] Add colour-coded orientation badges (South=green, East=blue, West=orange, North=red)
  - [x] Implement panel count adjustments for Project Solar panels (2.4m² vs Google's 1.96m²)
  - [x] Add imagery quality buffer (15% for medium quality)
  - [x] Integrate all features in SolarAssessmentPage
- [x] Implement CRO brief design changes
  - [x] Update CLAUDE.md with new co-branding and color palette
  - [x] Create LoaderTransitionPage with animated brand handover
  - [x] Redesign IndexPage as co-branded Thank You page
  - [x] Add The Eco Experts + Project Solar co-branding header
  - [x] Add "Why 50,000+ UK homes trust Project Solar" trust section
  - [x] Add "What Happens Next?" 3-step section
  - [x] Implement "No thank you" callback confirmation (0800 112 3110)
  - [x] Update color palette to Project Solar brand (#03624C, #DAE7E6, #9ECBA7)
  - [x] Update all component styles with new colors
  - [x] Update tests for new IndexPage design
