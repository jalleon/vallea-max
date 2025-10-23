# Changelog

All notable changes to the Valea Max project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2025-01-23

#### Inspection Module Enhancements
- **Completion Status Indicators**
  - Properties at 100% inspection completion now display "Complété" status with green background
  - Progress bar turns green (#4CAF50) when inspection reaches 100%
  - Button text changes to "Voir inspection" instead of "Continuer l'inspection" when complete
  - Applied to both PropertyView and PropertyEdit components

- **Floor Details Display**
  - Changed floor details from showing room counts (e.g., "4/8 pièces") to displaying actual room type names
  - Rooms are numbered when multiple of the same type exist on a floor (e.g., "Chambre #2")
  - Full i18n support for room type names

- **Auto-populated Property Fields**
  - Property details section now auto-populates from inspection data when available
  - Fields include: Nombre de pièces, Nombre de chambres, Salle de bain, Salle d'eau
  - Uses same room counting logic as InspectionProgressWindow
  - Only counts completed rooms (rooms with actual data filled)
  - Proper basement detection for room categorization
  - Fields are read-only when populated from inspection to maintain data integrity

#### Library Module Improvements
- **Enhanced Table Settings**
  - Changed default rows per page from 10 to 25
  - Changed default sort order to descending (newest/highest ID first)
  - Added 100 rows per page option to pagination (options: 5, 10, 25, 50, 100)

- **Keyboard Shortcuts & Navigation**
  - Double-click any table row to open property view window
  - Press "E" key to edit the selected property (first if multiple selected)
  - Keyboard shortcuts only trigger when not typing in input fields
  - Improves workflow efficiency for power users

#### UI/UX Enhancements
- **Collapsible Sidebar**
  - Added toggle button to collapse/expand sidebar
  - Mini mode: 80px width showing only icons with tooltips
  - Full mode: 280px width showing icons, labels, and descriptions
  - Smooth 0.3s transitions between states
  - User preference saved in localStorage
  - Desktop only (mobile always shows full drawer when open)
  - Follows industry best practices (Gmail, Slack, Discord pattern)

### Fixed - 2025-01-23

#### TypeScript Compilation Errors
- **batiment/page.tsx**
  - Fixed "possibly undefined" error when accessing `inspection_batiment` properties
  - Used local const variable for proper TypeScript type narrowing
  - Best practice: explicit type narrowing within conditional blocks

- **InspectionProgressWindow.tsx**
  - Fixed "Type unknown is not assignable to type string" errors
  - Added explicit type annotations: `let displayValue: string`
  - Used `String()` constructor for safe type conversion
  - Applied to all instances in room materials, building subcategories, and exterior sections
  - No unsafe type assertions used

#### Translation Issues
- **Room Type Display**
  - Fixed raw translation keys displaying as text (e.g., "inspection.rooms.salle_bain")
  - Implemented regex conversion from snake_case (database) to camelCase (i18n keys)
  - Pattern: `roomType.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())`

### Changed - 2025-01-23

#### PropertyEdit Component
- Synchronized inspection display with PropertyView
- Building characteristics fields now link to inspection data
- Fields auto-populate but remain editable for manual overrides
- Maintains data consistency between view and edit modes

#### Room Counting Logic
- Unified room counting logic across PropertyView and PropertyEdit
- Only counts rooms with completed/filled data
- Basement detection: `floorId === 'sous_sol' || floor.name?.toLowerCase().includes('sous-sol')`
- Excluded room types: salle_bain, salle_eau, vestibule, solarium
- Bedrooms: above ground only
- Bathrooms/powder rooms: all floors counted

### Technical Details

#### Best Practices Applied
- **TypeScript**: Explicit type annotations over type inference for complex types
- **Type Safety**: Local const variables for type narrowing instead of type assertions
- **Code Quality**: No `as any` or unsafe type casting used
- **Maintainability**: Self-documenting code with clear type declarations
- **User Experience**: localStorage for preference persistence
- **Performance**: Smooth CSS transitions (0.3s ease-in-out)

#### Files Modified
- `app/[locale]/library/page.tsx` - Library table defaults and keyboard shortcuts
- `app/[locale]/inspection/[id]/batiment/page.tsx` - TypeScript fixes
- `features/library/components/PropertyView.tsx` - Inspection completion display
- `features/library/components/PropertyEdit.tsx` - Inspection integration
- `features/inspection/components/InspectionProgressWindow.tsx` - TypeScript fixes
- `components/layout/MaterialDashboardLayout.tsx` - Sidebar state management
- `components/layout/MaterialSidebar.tsx` - Collapsible sidebar implementation

#### Commits
- fd291c2 - feat: add 100 rows per page option to library table
- a21fae4 - feat: update library default settings
- f7ccbff - feat: add keyboard shortcut and double-click for library table
- 5e38bf5 - feat: add collapsible sidebar with mini mode
- 2cd0110 - revert: make inspection-populated fields read-only
- 93be395 - fix: make inspection-populated fields editable in PropertyEdit
- ef6ea3f - feat: allow manual override of inspection-populated fields in PropertyEdit
- b32e28c - feat: auto-populate property details from inspection data
- 4bfbe73 - fix: use correct room count logic from InspectionProgressWindow
- a9eaa81 - feat: display room names instead of counts in floor details
- 48e0f19 - fix: convert snake_case to camelCase for room type translations
- 68eac4b - feat: show completion status when inspection reaches 100%
- a960bf5 - feat: update PropertyEdit to match PropertyView inspection display
- fd8648a - fix: add null check for inspection_batiment in batiment page
- 55c6ad5 - fix: use local variable for type narrowing in batiment page
- 0850eb3 - fix: add proper TypeScript type annotations for displayValue

---

## Version History

### [2.3.0] - 2025-01-23
- Inspection module completion indicators
- Library table enhancements and keyboard shortcuts
- Collapsible sidebar with localStorage persistence
- TypeScript compilation fixes
- Room counting and display improvements

---

**Note**: This changelog tracks changes for the Valea Max real estate appraisal platform.
