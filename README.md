# Valea Max - Real Estate Appraisal Application

A comprehensive real estate appraisal application built with Next.js 14.2.33, TypeScript, and Material-UI, designed for property management and evaluation.

## Project Overview

This application provides a complete property management system with features for creating, viewing, editing, and managing real estate properties. The system includes sophisticated UI/UX design, unit conversions, keyboard navigation, comprehensive data persistence, and advanced search/filtering capabilities.

## Technology Stack

- **Framework**: Next.js 14.2.33 with App Router
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v6+
- **State Management**: React Hooks (useState, useEffect)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth with custom auth context
- **Styling**: MUI theming with custom gradients and styling

## Features Implemented

### 1. Authentication System

#### Login & Signup (`app/login/page.tsx`, `app/signup/page.tsx`)
- **Alternating Background Images**: Random property images from `public/backgrounds/` on each page load
- **Dimmed Backgrounds**: 70% brightness overlay for better form readability
- **Valea Max Branding**: Custom logo with rounded corners
- **Secure Authentication**: Supabase Auth integration
- **Auto-redirect**: Redirects to `/dashboard` after successful login/signup
- **French Interface**: Fully localized UI

### 2. Library Module (Property Management)

#### Main Property Table (`app/library/page.tsx`)
- **Compact Display**: Single-line rows with reduced heights (py: 0.75)
- **Advanced Search Bar**: Multi-field search across address, city, MLS, ID, and source
- **Dynamic Type Filter**: Shows only property types present in database (Condo, Unifamiliale, Plex, Appartement, Semi-commercial, Terrain, Commercial, Autre)
- **Dynamic City Filter**: Populated with cities from actual property data
- **Advanced Filters Panel**: Collapsible section with:
  - Date range filtering (sale date from/to)
  - Price range filtering (min/max with $ symbol)
  - Construction year range filtering
- **Real-time Filtering**: All filters work together with instant results
- **Result Count Display**: Shows number of filtered results
- **Clear Filters**: One-click reset of all filters
- **Functional Actions**: Complete CRUD operations with icon buttons
- **Data Persistence**: Real-time updates with Supabase database
- **Responsive Design**: Material-UI based responsive layout with compact spacing
- **Pagination**: Customizable rows per page with French labels

#### Property View Component (`features/library/components/PropertyView.tsx`)
- **Advanced Dialog Interface**: Full-screen property viewer with gradient header
- **Keyboard Navigation**: Arrow keys (←→) for navigating between properties
- **Enhanced Visual Design**: Professional card-based layout with icons and gradients
- **Comprehensive Property Display**: All property details organized in logical sections
- **Dual Unit Display**: Metric and imperial units throughout (m²/pi², m/ft)
- **Navigation Controls**: Previous/Next buttons with disabled states
- **Status Indicators**: Color-coded property status chips
- **Price Banner**: Prominent display of sale price, date, and habitable area

#### Property Edit Component (`features/library/components/PropertyEdit.tsx`)
- **Sophisticated Form Design**: Multi-section form with gradient styling and icons
- **Enhanced Field Types**:
  - **Dollar Amount Fields**: Prix de vente and Prix demandé with $ icons
  - **Dropdown Fields**:
    - Genre de propriété (7 options: Plain-pied, À étages, Paliers multiples, Un étage et demi, Mobile, Maison de ville, Terrain vacant)
    - Province selector (All 13 Canadian provinces and territories)
    - Type de propriété, Statut, Stationnement, Type de sous-sol
  - **Auto-Converting Measurement Fields**: Real-time conversion between metric/imperial
- **Superficies Section**:
  - Terrain fields with auto-conversion (m² ↔ pi²)
  - Frontage/Profondeur fields (m ↔ ft)
  - Périmètre du bâtiment fields (m² ↔ pi²)
  - Floor area management with interactive table
- **Field Naming Updates**:
  - "Municipalité" → "Arrondissement"
- **Smart Input Behavior**:
  - Free typing without immediate decimal formatting
  - Auto-conversion applies 2 decimal places only to converted field
  - Proper handling of empty values

#### Floor Area Management
- **Interactive Floor Addition**: Add floors with dropdown selection and area inputs
- **Real-time Calculations**: Automatic calculation of total habitable area
- **Visual Floor Table**: Enhanced table with icons, type indicators, and delete functionality
- **Dual Unit Totals**: Display totals in both m² and pi²
- **Type Classification**: Automatic classification of floors as 'hors-sol' or 'sous-sol'

#### Data Layer (`features/library/_api/properties-supabase.service.ts`)
- **Complete CRUD Operations**: Create, Read, Update, Delete with proper error handling
- **Supabase Integration**: Real-time database with PostgreSQL
- **Pagination Support**: Efficient data loading with limit/offset
- **Property Duplication**: Clone existing properties with one click
- **Bulk Delete**: Delete multiple properties at once
- **Date Handling**: Proper serialization/deserialization of Date objects
- **Type Safety**: Full TypeScript integration with Property interfaces
- **Error Handling**: Comprehensive error handling and user feedback

### 2. Type System (`features/library/types/property.types.ts`)

#### Core Property Interface
```typescript
interface Property {
  // Core identification
  id: string
  organization_id: string
  created_by: string

  // Location fields
  adresse: string
  ville?: string
  municipalite?: string  // Used as "Arrondissement"
  code_postal?: string
  province?: string

  // Financial fields
  prix_vente?: number
  prix_demande?: number
  date_vente?: Date
  jours_sur_marche?: number

  // Property characteristics
  status?: PropertyStatus
  type_propriete?: PropertyType
  genre_propriete?: string
  annee_construction?: number
  zonage?: string

  // Measurements (all with dual units)
  superficie_terrain_m2?: number
  superficie_terrain_pi2?: number
  frontage_m2?: number
  profondeur_m2?: number
  frontage_pi2?: number
  profondeur_pi2?: number
  superficie_habitable_m2?: number
  superficie_habitable_pi2?: number
  perimetre_batiment_m2?: number
  perimetre_batiment_pi2?: number

  // Building details
  nombre_pieces?: number
  nombre_chambres?: number
  salle_bain?: number
  salle_eau?: number
  stationnement?: ParkingType
  dimension_garage?: string
  type_sous_sol?: BasementType
  toiture?: string
  ameliorations_hors_sol?: string
  numero_mls?: string

  // Floor areas
  floor_areas?: FloorArea[]

  // Metadata
  media_references: MediaReference[]
  source?: string
  notes?: string
  is_template: boolean
  is_shared: boolean
  created_at: Date
  updated_at: Date
}
```

#### Enum Types
- **PropertyType**: 'Condo' | 'Unifamiliale' | 'Plex' | 'Appartement' | 'Semi-commercial' | 'Terrain' | 'Commercial' | 'Autre'
- **PropertyStatus**: 'Vendu' | 'À vendre' | 'Actif' | 'Retiré' | 'Conditionnel' | 'Expiré'
- **BasementType**: 'Aucun' | 'Complet' | 'Partiel' | 'Complet aménagé' | 'Complet non-aménagé' | 'Partiel aménagé' | 'Partiel non-aménagé' | 'Vide sanitaire' | 'Dalle de béton'
- **ParkingType**: 'Allée' | 'Garage' | 'Abri d\'auto' | 'Rue' | 'Aucun'
- **FloorType**: 'Sous-sol' | 'Rez-de-chaussée' | '2e étage' | '3e étage' | 'Comble' | 'Mezzanine'

### 3. Utility Functions (`lib/utils/formatting.ts`)

#### Unit Conversion Constants
- **Area Conversion**: 1 m² = 10.764 pi²
- **Length Conversion**: 1 m = 3.28084 ft

#### Key Functions
- **formatMeasurement()**: Automatic dual-unit display with proper decimal places
- **formatCurrency()**: Canadian dollar formatting
- **formatDate()**: French-Canadian date formatting
- **convertArea()**: Area conversions between m² and ft²

### 4. Visual Design System

#### Color Scheme & Gradients
- **Primary Gradients**: Blue-based gradients (#667eea to #764ba2) for headers and primary actions
- **Success Gradients**: Green-based for financial information
- **Info Gradients**: Light blue for measurement sections
- **Warning/Secondary**: Orange/purple for building characteristics
- **Background Images**: Alternating real estate property images with 70% brightness

#### Typography Hierarchy
- **Headers**: h4-h6 variants with proper font weights
- **Body Text**: Consistent body2 with 0.875rem (14px) font size for compact display
- **Labels**: Text.secondary for field labels
- **Table Text**: Compact 0.875rem sizing throughout for efficient space usage

#### Component Styling
- **Cards**: Elevated with border radius and reduced padding (p: 2) for compact layout
- **Buttons**: Gradient backgrounds with hover effects, size="small" throughout
- **Form Fields**: Consistent size="small" variant across all inputs
- **Tables**: Professional styling with single-line rows (py: 0.75), nowrap, and ellipsis overflow
- **Icons**: Reduced to fontSize="small" (16px) for compact display
- **Chips**: Height 24px with 0.75rem labels

## User Experience Features

### 1. Search & Filtering
- **Multi-field Search**: Search across address, city, MLS number, ID, and source
- **Quick Filters**: Dropdown filters for property type and city
- **Advanced Filters**: Collapsible panel with date range, price range, and year range filters
- **Real-time Results**: Instant filtering with result count display
- **Filter Persistence**: Filters remain active during pagination
- **Clear All**: One-click reset of all active filters

### 2. Keyboard Navigation
- **Arrow Keys**: Navigate between properties in view mode (← →)
- **Escape Key**: Close dialogs and return to main view
- **Tab Navigation**: Proper tab order through form fields

### 3. Responsive Behavior
- **Grid System**: Material-UI responsive grid throughout
- **Mobile Adaptation**: Forms adapt to smaller screens
- **Touch-Friendly**: Proper button sizes and spacing
- **Compact Display**: Optimized for viewing maximum records per page

### 4. Data Validation
- **Type Safety**: TypeScript ensures proper data types
- **Input Validation**: Proper number parsing and validation
- **Error Handling**: Graceful handling of invalid data
- **Required Fields**: Clear validation for required property information

### 5. User Feedback
- **Loading States**: Proper loading indicators with CircularProgress
- **Success/Error Messages**: Snackbar notifications for all actions
- **Visual Cues**: Color coding for status and types
- **Selection States**: Visual feedback for selected rows
- **Bulk Actions**: Delete multiple properties with confirmation dialog

## Known Issues Resolved

### 1. MUI Alpha Function Error
- **Issue**: `MUI: Unsupported 'white' color` error
- **Solution**: Replaced `alpha('white', 0.3)` with `rgba(255, 255, 255, 0.3)`

### 2. Date Handling Errors
- **Issue**: "Invalid time value" errors in PropertyEdit
- **Solution**: Added safe date conversion with try-catch blocks

### 3. Syntax Errors
- **Issue**: Orphaned JSX tags and unclosed brackets
- **Solution**: Complete component rewrites with proper JSX structure

### 4. Data Persistence
- **Issue**: Changes not persisting in main library table
- **Solution**: Implemented proper React state management with localStorage service

### 5. Decimal Formatting Issues
- **Issue**: Immediate decimal formatting preventing multi-digit input
- **Solution**: Removed `.toFixed()` from input values, only apply to converted fields

### 6. Display Duplication
- **Issue**: Superficie terrain showing "450.00 m² / 4844 pi² / 450.00 m² / 4844 pi²"
- **Solution**: Call `formatMeasurement()` once instead of twice with concatenation

### 7. Login Redirect Issue
- **Issue**: Login/signup redirecting to /library instead of /dashboard
- **Solution**: Updated router.push() calls to redirect to '/dashboard'

### 8. Property Type Filtering
- **Issue**: Type filter showing dynamic types instead of complete list
- **Solution**: Use PROPERTY_TYPES constant for complete dropdown options

### 9. Multi-line Table Rows
- **Issue**: Table rows wrapping to multiple lines with long addresses
- **Solution**: Applied whiteSpace: 'nowrap' to all cells, ellipsis overflow for addresses

## File Structure

```
vallea-max/
├── app/
│   ├── library/
│   │   └── page.tsx                 # Main library page with advanced filtering
│   ├── login/
│   │   └── page.tsx                 # Login page with background images
│   ├── signup/
│   │   └── page.tsx                 # Signup page with background images
│   ├── dashboard/
│   │   └── page.tsx                 # Dashboard landing page
│   ├── globals.css                  # Global styles
│   └── layout.tsx                   # App layout
├── features/
│   └── library/
│       ├── components/
│       │   ├── PropertyEdit.tsx     # Property edit dialog
│       │   ├── PropertyForm.tsx     # Form component
│       │   ├── PropertyTable.tsx    # Data table
│       │   └── PropertyView.tsx     # Property view dialog
│       ├── _api/
│       │   └── properties-supabase.service.ts  # Supabase service
│       ├── constants/
│       │   └── property.constants.ts  # Property type constants
│       └── types/
│           └── property.types.ts    # TypeScript interfaces
├── contexts/
│   └── AuthContext.tsx              # Authentication context
├── hooks/
│   └── useRandomBackground.ts       # Random background image hook
├── lib/
│   └── utils/
│       ├── calculations.ts          # Calculation utilities
│       └── formatting.ts            # Formatting utilities
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx      # Route protection component
│   ├── ui/                          # Reusable UI components
│   └── layout/
│       └── MaterialDashboardLayout.tsx  # Dashboard layout
├── public/
│   ├── backgrounds/                 # Login/signup background images
│   │   ├── bg1.jpg
│   │   └── bg2.jpg
│   └── logo.png                     # Valea Max logo
└── README.md                        # This file
```

## Development Commands

```bash
# Start development server (auto-selects available port)
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

## Environment Variables

Create a `.env.local` file with the following:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Future Enhancements

### 1. Additional Features
- Image upload and management for properties
- Property comparison tools
- Export functionality (PDF, Excel)
- Print-friendly views
- Map view integration
- Saved search filters
- Email notifications

### 2. Performance Optimizations
- Implement virtual scrolling for large datasets
- Add caching strategies
- Optimize bundle size
- Add lazy loading for images
- Server-side filtering for large datasets

### 3. Analytics & Reporting
- Property value trends
- Market analysis tools
- Comparative market analysis (CMA)
- Custom report generation

## Testing Strategy

### 1. Unit Testing
- Component testing with React Testing Library
- Utility function testing
- Type checking validation

### 2. Integration Testing
- Form submission workflows
- Data persistence testing
- Navigation flow testing

### 3. E2E Testing
- Complete user workflows
- Cross-browser compatibility
- Mobile responsiveness

## Contributing

When making changes to this project:

1. **Follow TypeScript best practices**
2. **Maintain Material-UI design consistency**
3. **Test all unit conversions thoroughly**
4. **Ensure responsive design on all screen sizes**
5. **Update this documentation for any new features**

## Version History

- **v1.0**: Initial library module implementation
- **v1.1**: Enhanced PropertyView with keyboard navigation
- **v1.2**: Complete PropertyEdit redesign with auto-conversions
- **v1.3**: Data persistence and CRUD operations
- **v1.4**: Field enhancements and dropdown implementations
- **v1.5**: Bug fixes and display optimizations
- **v2.0**: Supabase integration and authentication system
- **v2.1**: Advanced filtering and search capabilities
- **v2.2**: Compact UI redesign with single-line table rows
- **v2.3**: Alternating background images for auth pages (current)

---

*Last updated: 2025-10-04*
*Next.js Version: 14.2.33*
*Material-UI Version: 6+*
*Database: Supabase PostgreSQL*