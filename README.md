# Valea Max - Real Estate Appraisal Platform

A comprehensive real estate appraisal platform built with Next.js 14, TypeScript, and Material-UI, designed for professional property appraisers and real estate evaluators in Canada.

## Overview

Valea Max is a bilingual (French/English) SaaS platform that streamlines the real estate appraisal process from property data management to final report generation. The platform combines modern web technologies with industry-standard appraisal methodologies to deliver a professional, efficient workflow.

## Core Features

### 1. Property Library Module
Comprehensive property database management with advanced search and filtering:
- **Dynamic Property Management**: CRUD operations with real-time Supabase sync
- **Advanced Filtering**: Multi-field search, date ranges, price ranges, property types
- **Dual Unit Display**: Automatic metric/imperial conversions (m²/pi², m/ft)
- **Property Types**: Condo, Single-Family, Duplex, Triplex, Quadruplex+, Apartment, Semi-Commercial, Commercial, Land
- **Floor Area Management**: Interactive floor-by-floor area tracking
- **Import/Export**: Property duplication, bulk operations

### 2. Évaluations (Appraisals) Module
Professional appraisal report creation with three standardized templates:

#### Template Types
- **RPS (Real Property Solutions)**: 19-section comprehensive residential appraisal
- **NAS (Nationwide Appraisal Services)**: 13-section streamlined residential report
- **CUSTOM**: 17-section flexible template with advanced tools

#### Appraisal Features
- **3-Column Layout**: Sections sidebar, form editor, live preview panel
- **Section Navigation**: Tree view with completion indicators, quick search (Cmd/Ctrl+K)
- **Rich Text Editor** (Tiptap): Professional narrative sections with formatting, tables, images
- **AI Writing Assistant** (OpenAI): Generate neighborhood descriptions, market analyses, improve text
- **Narrative Snippets**: Reusable text templates for common sections
- **Smart Forms**: Property-type-aware fields with conditional rendering
- **Direct Comparison Method**: AG Grid spreadsheet for comparables analysis
- **Adjustments Calculator**: Dynamic adjustment rates with organization presets
- **Auto-Population**: Subject property data from Library module
- **Progress Tracking**: Real-time completion percentage per section
- **Auto-Save**: 30-second debounced saves with draft recovery
- **Version History**: Restore from previous auto-save versions
- **Import from Previous**: Load data from past reports

### 3. Direct Comparison / Parity Method
Spreadsheet-style comparables analysis with AG Grid:
- **Import from Library**: Multi-select properties with filters
- **Inline Editing**: Excel-like cell editing with keyboard navigation
- **Auto-Calculations**: Total adjustments, adjusted sale prices, value indicators
- **Undo/Redo**: Full edit history (Ctrl+Z / Ctrl+Shift+Z)
- **Metric/Imperial Toggle**: Switch units on the fly
- **Custom Labels**: Override default adjustment category names
- **Organization Presets**: Save and reuse standard adjustment rates by property type

### 4. Adjustments Calculator
Advanced adjustment analysis tool:
- **Property-Type Specific**: Different adjustment categories per property type
- **10 Categories**: Location, Lot Size, Living Area, Bedrooms, Bathrooms, Age/Condition, Basement, Garage/Parking, Pool/Extras, Market Conditions
- **Condo-Specific**: Floor level, unit size, balcony/terrace, amenities, parking space
- **Land-Specific**: Size, zoning, topography, access/utilities
- **Commercial-Specific**: Location, NLA, occupancy, condition/age
- **Smart Validation**: Warnings for unusual values, missing data
- **Export to Excel**: Download comparables grid as .xlsx

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.33 with App Router
- **Language**: TypeScript (strict mode)
- **UI Library**: Material-UI (MUI) v6+
- **Forms**: React Hook Form + Zod validation
- **Rich Text**: Tiptap v3 with extensions (tables, character count, placeholder)
- **Data Grid**: AG Grid Community v34.3.1
- **Charts**: Recharts v3.3

### Backend & Database
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth with Google OAuth
- **Storage**: Supabase Storage for files
- **RLS**: Row Level Security for multi-tenant isolation
- **API**: Supabase REST API + Real-time subscriptions

### Integrations
- **AI**: OpenAI GPT-4 for writing assistance
- **Payments**: Stripe for subscriptions
- **Email**: Mailjet for transactional emails
- **Analytics**: PostHog, Google Analytics 4, Vercel Analytics
- **Monitoring**: Sentry for error tracking, Better Uptime for status monitoring

### Deployment
- **Hosting**: Vercel (auto-deploy from GitHub)
- **Environment**: Production, Staging, Development
- **CDN**: Vercel Edge Network
- **SSL**: Automatic HTTPS

## Internationalization (i18n)

**Bilingual Support**: French (default) and English
- **Framework**: next-intl v4.3.9
- **Translation Files**: `messages/fr.json`, `messages/en.json`
- **Route Structure**: `/fr/*`, `/en/*`
- **Dynamic Language Switching**: User preference persisted in profile

## Project Structure

```
valea-max/
├── app/[locale]/                    # Next.js App Router pages
│   ├── library/                     # Property management
│   ├── evaluations/                 # Appraisals module
│   │   ├── new/                     # Appraisal creation wizard
│   │   └── [id]/                    # Appraisal editor
│   ├── dashboard/                   # Main dashboard
│   ├── login/                       # Authentication
│   └── signup/
├── features/                        # Feature modules
│   ├── library/                     # Property library
│   │   ├── _api/                    # Supabase services
│   │   ├── components/              # UI components
│   │   ├── types/                   # TypeScript types
│   │   └── constants/               # Constants & enums
│   └── evaluations/                 # Appraisals
│       ├── _api/                    # Appraisal services
│       ├── components/              # Appraisal UI
│       │   ├── AppraisalLayout.tsx
│       │   ├── SectionsSidebar.tsx
│       │   ├── LivePreview.tsx
│       │   ├── NarrativeEditor.tsx
│       │   ├── AIWritingAssistant.tsx
│       │   ├── DirectComparisonForm.tsx
│       │   ├── AdjustmentsForm.tsx
│       │   └── SmartValidationWarnings.tsx
│       ├── types/                   # TypeScript interfaces
│       ├── constants/               # Evaluation constants
│       └── hooks/                   # Custom React hooks
├── components/                      # Reusable components
│   ├── layout/                      # Layout components
│   │   ├── MaterialDashboardLayout.tsx
│   │   └── Sidebar.tsx
│   └── ui/                          # UI primitives
├── lib/                             # Utilities
│   ├── supabase/                    # Supabase client
│   └── utils/                       # Helper functions
│       ├── formatting.ts            # Unit conversions, formatting
│       └── calculations.ts          # Math utilities
├── messages/                        # i18n translations
│   ├── fr.json
│   └── en.json
├── public/                          # Static assets
│   ├── backgrounds/                 # Auth page backgrounds
│   └── logo.png
├── supabase/                        # Database
│   └── migrations/                  # SQL migration files
├── CLAUDE.md                        # Development guidelines
└── APPRAISAL_UI_REDESIGN_PLAN.md   # Feature roadmap
```

## Database Schema

### Core Tables
- **organizations**: Multi-tenant organizations
- **profiles**: User profiles with organization membership
- **properties**: Property library with comprehensive data
- **appraisals**: Appraisal reports with JSONB form data
- **organization_adjustment_presets**: Saved adjustment rates by property type
- **user_preferences**: User-specific settings (recently added)

### Auth & Subscriptions
- **user_subscriptions**: Stripe subscription management
- **waitlist**: Beta access requests
- **demo_requests**: Demo booking system
- **email_verifications**: Email verification tokens

### Metadata
- **api_usage_tracking**: Monitor OpenAI API usage
- **master_api_keys**: Centralized API key management

## Setup & Installation

### Prerequisites
- Node.js 20+ and npm
- Supabase account
- Vercel account (for deployment)
- Stripe account (for payments)
- OpenAI API key (for AI features)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vallea-max
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local`:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   STRIPE_SECRET_KEY=your_stripe_secret

   # Mailjet
   MAILJET_API_KEY=your_mailjet_api_key
   MAILJET_API_SECRET=your_mailjet_secret

   # Analytics
   NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

   # Sentry
   SENTRY_DSN=your_sentry_dsn
   ```

4. **Run database migrations**
   ```bash
   npx supabase db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:3001`

### Build for Production

```bash
npm run build
npm run start
```

## Development Commands

```bash
# Development
npm run dev              # Start dev server on port 3001

# Production
npm run build            # Build production bundle
npm run start            # Start production server

# Quality
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking (if configured)
```

## Key Patterns & Best Practices

### 1. Service Layer Pattern
All database operations go through service files:
```typescript
// features/[module]/_api/[module].service.ts
import { createClient } from '@/lib/supabase/client';

export const moduleService = {
  getAll: async () => { /* ... */ },
  create: async (data) => { /* ... */ },
  update: async (id, data) => { /* ... */ },
  delete: async (id) => { /* ... */ }
};
```

### 2. Type Assertions at Database Boundaries
Supabase uses generic `Json` types; cast at boundaries:
```typescript
// Reading JSONB
const data = property.form_data as unknown as FormDataType

// Writing JSONB
await supabase.update({
  form_data: formData as any
})

// Sanitize empty strings to null
Object.keys(data).forEach(key => {
  if (data[key] === '') data[key] = null
})
```

### 3. Internationalization
Always use i18n for user-facing text:
```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('evaluations');
<Typography>{t('title')}</Typography>
```

### 4. MUI Styling Consistency
```typescript
sx={{
  borderRadius: '16px',      // Rounded corners
  fontSize: '14px',          // Compact text
  minHeight: '48px',         // Touch-friendly
  textTransform: 'none'      // No uppercase
}}
```

### 5. Dual Unit Conversions
```typescript
import { formatMeasurement, convertArea } from '@/lib/utils/formatting';

// Display: "450.00 m² / 4,844 pi²"
formatMeasurement(area_m2, area_pi2, 'm²', 'pi²')

// Convert
const pi2 = convertArea(100, 'm²', 'pi²') // 1076.4
```

## API Integrations

### OpenAI Integration
Used for AI Writing Assistant:
- **Model**: GPT-4
- **Use Cases**: Neighborhood descriptions, market analyses, text improvements
- **Rate Limiting**: Tracked in `api_usage_tracking` table
- **Prompts**: Stored in `features/evaluations/components/AIWritingAssistant.tsx`

### Stripe Integration
Subscription management:
- **Plans**: Free, Pro, Enterprise (defined in Stripe Dashboard)
- **Webhooks**: Handle subscription events
- **Customer Portal**: Manage billing, cancel subscriptions

### Mailjet Integration
Transactional emails:
- **Welcome emails**: New user onboarding
- **Verification emails**: Email confirmation
- **Report emails**: Send appraisals to clients

## Keyboard Shortcuts

### Global
- `Cmd/Ctrl + K` - Quick section search
- `Cmd/Ctrl + S` - Manual save
- `Cmd/Ctrl + P` - Toggle preview panel
- `Cmd/Ctrl + B` - Toggle sidebar

### AG Grid (Comparables)
- `Tab` - Next cell
- `Shift + Tab` - Previous cell
- `Enter` - Edit cell
- `Esc` - Cancel edit
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo

### Rich Text Editor
- `Cmd/Ctrl + B` - Bold
- `Cmd/Ctrl + I` - Italic
- `Cmd/Ctrl + U` - Underline
- `Cmd/Ctrl + Alt + 1` - Heading 1
- `Cmd/Ctrl + Shift + 7` - Ordered list
- `Cmd/Ctrl + Shift + 8` - Bullet list

## Deployment

### Vercel Deployment
1. **Connect GitHub repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Auto-deploy**: Pushes to `main` trigger deployments
4. **Preview deployments**: PRs get unique preview URLs

### Environment Variables in Vercel
All `NEXT_PUBLIC_*` variables must be set in Vercel dashboard.

**Note**: For client-side APIs (Google Maps, etc.), hardcode public API keys directly in components. `process.env` doesn't work reliably in client components during production builds.

## Performance Optimization

### Implemented
- **Code Splitting**: Next.js automatic route-based splitting
- **Lazy Loading**: React.lazy for heavy components (AG Grid, PDF viewer)
- **Memoization**: useMemo, useCallback for expensive operations
- **Debouncing**: Auto-save (30s), search (300ms), preview (500ms)
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Next.js Font optimization

### Metrics
- **Initial Load**: < 3 seconds (95th percentile)
- **Section Switch**: < 100ms
- **Auto-Save**: < 500ms
- **Lighthouse Score**: > 90 (Performance)

## Security

### Authentication
- **Supabase Auth**: Email/password, Google OAuth
- **JWT Tokens**: Secure session management
- **Email Verification**: Required for new accounts

### Authorization
- **Row Level Security (RLS)**: All tables protected
- **Multi-Tenant**: `organization_id` isolation
- **Role-Based**: Admin, user roles (in profiles table)

### Data Protection
- **HTTPS**: Enforced on all endpoints
- **CORS**: Configured for Vercel domains only
- **API Keys**: Stored in Supabase, never in frontend
- **Sanitization**: XSS prevention, SQL injection protection via Supabase

## Roadmap & Future Features

### Phase 1: Foundation (Completed)
- ✅ 3-column layout with sidebar navigation
- ✅ Enhanced library import for comparables
- ✅ Live HTML preview panel

### Phase 2: Rich Text & AI (Completed)
- ✅ Tiptap rich text editor for narratives
- ✅ OpenAI writing assistant
- ✅ Narrative snippet library

### Phase 3: PDF Export (In Progress)
- ⏳ PDF generation with react-pdf
- ⏳ Export to Word (DOCX)
- ⏳ Email to client functionality
- ⏳ Supabase Storage for PDF archival

### Phase 4: Smart Forms (Planned)
- 🔮 Conditional field rendering based on property type
- 🔮 Remember past inputs per user
- 🔮 AI-powered auto-suggestions
- 🔮 Import data from previous reports
- 🔮 Smart validation warnings

### Phase 5: Polish & Accessibility (Planned)
- 🔮 Comprehensive keyboard shortcuts
- 🔮 Auto-save with version history
- 🔮 WCAG AA compliance
- 🔮 Performance optimizations
- 🔮 Error boundaries and better loading states

## Testing

### Current Status
Manual testing in development and staging environments.

### Future Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Cypress or Playwright
- **E2E Tests**: Critical user flows (create appraisal, export PDF)
- **Accessibility Tests**: axe DevTools, WAVE
- **Performance Tests**: Lighthouse CI

## Contributing

When making changes to this project:

1. **Follow TypeScript best practices** - Use strict types, avoid `any`
2. **Use i18n for all text** - Add keys to both fr.json and en.json
3. **Follow existing patterns** - Check CLAUDE.md for guidelines
4. **Test dual units** - Verify m²/pi² conversions
5. **Update documentation** - Keep README and CLAUDE.md current
6. **Commit messages**: Use conventional commits (feat:, fix:, docs:)

## Support & Documentation

- **Developer Guidelines**: See [CLAUDE.md](CLAUDE.md)
- **Feature Roadmap**: See [APPRAISAL_UI_REDESIGN_PLAN.md](APPRAISAL_UI_REDESIGN_PLAN.md)
- **Issues**: Report bugs via GitHub Issues
- **Questions**: Contact development team

## License

Proprietary - Valea Immobilier © 2024-2025

---

**Current Version**: 2.4 (November 2024)
**Last Updated**: 2024-11-16
**Next.js Version**: 14.2.33
**Material-UI Version**: 6+
**Database**: Supabase PostgreSQL
**Status**: Active Development
