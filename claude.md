# Claude Code Guidelines - Valea Max Project

## 🧠 Core Philosophy
**THINK HARD. ANSWER SHORT. CODE SIMPLE.**

- Implement web UI in the **simplest & most lightweight way possible**
- **The fewer lines of code, the better**
- Reuse existing patterns and components
- Avoid over-engineering

---

## 📚 Project Context

### Technology Stack
- **Framework**: Next.js 14.2.33 with App Router
- **Language**: TypeScript (strict mode)
- **UI Library**: Material-UI (MUI) v6+
- **Database**: Supabase PostgreSQL (single database for all data)
- **Hosting**: Vercel
- **State Management**: React Hooks (useState, useEffect)

### Key Directories
```
app/[locale]/          # Next.js pages with i18n routing
features/              # Feature modules (library, inspection, etc.)
components/            # Reusable UI components
lib/utils/             # Utility functions
messages/              # i18n translation files
```

---

## 🌍 Internationalization (i18n)

**ALWAYS use i18n for all user-facing text**

### Framework: next-intl
```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('inspection');
// Use: t('createNew'), t('categories.pieces'), etc.
```

### Languages Supported
- **French (fr)** - Default language
- **English (en)**

### Translation Files
- `messages/fr.json` - French translations
- `messages/en.json` - English translations

**When adding new features:**
1. Add translation keys to BOTH language files
2. Use descriptive nested keys (e.g., `inspection.form.address`)
3. Follow existing patterns in the translation files

---

## 🗄️ Database (Supabase)

### Connection
- **Single Supabase database** for all data
- Connection via environment variables in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Database Patterns
- **RLS (Row Level Security)**: Enforced at database level
- **Multi-tenant**: Data isolated by `organization_id`
- **Auto-managed fields**: `id`, `created_at`, `updated_at`, `organization_id`, `created_by`
- **JSONB for flexibility**: Use for complex nested data (e.g., `inspection_pieces`)

### Service Layer Pattern
```typescript
// features/[module]/_api/[module].service.ts
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const moduleService = {
  getAll: async () => { /* ... */ },
  getById: async (id) => { /* ... */ },
  create: async (data) => { /* ... */ },
  update: async (id, data) => { /* ... */ },
  delete: async (id) => { /* ... */ }
};
```

**Key Rules:**
- Always use the same database (no separate DBs)
- Use existing service patterns from `features/library/_api/`
- Let Supabase handle `organization_id` and `created_by` via RLS
- Use JSONB for complex inspection data

### Type Assertions with Supabase (IMPORTANT)

**Why needed**: Supabase uses generic `Json` types and `null`, while our TypeScript uses specific interfaces and `undefined`.

**Best Practice - Type assertions at database boundaries:**

```typescript
// ✅ READING from Supabase
const { data: property } = await supabase
  .from('properties')
  .select('inspection_pieces')
  .single()

// Cast to our domain type
const inspectionData = property.inspection_pieces as unknown as InspectionPieces

// ✅ WRITING to Supabase
const updatedData: InspectionPieces = { floors: {}, totalRooms: 0, completedRooms: 0 }

await supabase
  .from('properties')
  .update({
    inspection_pieces: updatedData as any,  // Cast when writing JSONB
    updated_at: new Date().toISOString()
  })

// ✅ SANITIZING form data (convert empty strings to null)
const sanitizedData: any = { ...formData }
Object.keys(sanitizedData).forEach(key => {
  if (sanitizedData[key] === '') {
    sanitizedData[key] = null  // Database expects null, not empty string
  }
})
```

**When to use type assertions:**
- ✅ Reading JSONB data from Supabase
- ✅ Writing custom types to JSONB columns
- ✅ Converting between Supabase's types and our domain types
- ✅ Form data that might have empty strings (convert to `null`)

**This is standard industry practice** (used by Stripe, GitHub, Vercel, etc.)

---

## 🎨 UI/UX Guidelines

### Material-UI Patterns
```typescript
// Consistent styling
sx={{
  borderRadius: '16px',      // Rounded corners
  fontSize: '14px',          // Compact text
  minHeight: '48px',         // Touch-friendly
  textTransform: 'none'      // No uppercase
}}
```

### Common Components
- **Cards**: `borderRadius: '16px'`, `elevation: 1`
- **Buttons**: `size="small"`, `borderRadius: '12px'`
- **Text Fields**: `size="small"`, compact spacing
- **Icons**: `fontSize="small"` (16px) or explicit size

### Color Scheme
- **Primary**: Blue gradients (#667eea to #764ba2)
- **Success**: Green (#4CAF50)
- **Warning**: Orange (#FF9800)
- **Secondary**: Purple (#9C27B0)
- **Inspection Categories**: See `INSPECTION_CATEGORIES` for specific colors

### Responsive Design
- **Mobile-first** approach
- **Grid layout**: Use MUI Grid with xs/sm/md breakpoints
- **Touch targets**: Minimum 48px for buttons on mobile/tablet
- **Compact display**: Maximize content visibility

---

## 📁 Module Structure Pattern

**Follow this structure for ALL new feature modules:**

```
features/[module-name]/
├── _api/
│   └── [module].service.ts        # Supabase CRUD operations
├── components/
│   ├── [Module]Form.tsx           # Form component
│   ├── [Module]Table.tsx          # Table/list component
│   └── [Module]View.tsx           # Detail view component
├── types/
│   └── [module].types.ts          # TypeScript interfaces
├── constants/
│   └── [module].constants.ts      # Enums, options, configs
└── hooks/
    └── use[Module].ts             # Custom React hooks (if needed)
```

---

## ✅ Code Quality Rules

### TypeScript
- **Always use TypeScript** - no `any` types unless absolutely necessary
- **Define interfaces** in `types/` folder
- **Use type safety** throughout
- **Type assertions at boundaries**: Use `as any` or `as unknown as Type` when interfacing with Supabase
  - Supabase uses generic `Json` types and `null` for optional values
  - Our app uses specific types (e.g., `InspectionPieces`) and `undefined` for optional values
  - Type assertions at the database boundary are standard practice

### Component Rules
1. **Use functional components** with hooks
2. **Extract reusable logic** into custom hooks
3. **Keep components small** (< 200 lines ideally)
4. **Use composition** over duplication

### Styling
- **Use MUI `sx` prop** for inline styles
- **No external CSS files** for components (use MUI theming)
- **Consistent spacing**: Use MUI spacing units (1 = 8px)

### Performance
- **Minimize re-renders**: Use `useCallback`, `useMemo` when appropriate
- **Avoid prop drilling**: Use context for deeply nested data
- **Lazy load** heavy components when possible

---

## 🔄 Existing Patterns to Reuse

### 1. Property Management (Library Module)
- Location: `features/library/`
- **Reuse**: Service patterns, form layouts, table structures
- **Reference**: `features/library/_api/properties-supabase.service.ts`

### 2. Unit Conversions
- Location: `lib/utils/formatting.ts`
- **Use**: `formatMeasurement()`, `convertArea()`, `formatCurrency()`
- **Pattern**: Dual metric/imperial display

### 3. Form Patterns
- **Location**: `features/library/components/PropertyEdit.tsx`
- **Reuse**: Section cards, gradient headers, dual-unit inputs

### 4. Navigation
- **Breadcrumbs**: Build clickable navigation paths
- **Sidebar**: Add menu items to `components/layout/Sidebar.tsx`

---

## 🚀 Deployment (Vercel)

### Auto-deployment
- **Push to GitHub** → Auto-deploys to Vercel
- **Environment variables** configured in Vercel dashboard
- **Database connection** via Supabase (same DB for dev/prod)

### Build Commands
```bash
npm run build      # Production build
npm run dev        # Development server
npm run lint       # ESLint check
```

### Environment Variables & Client Components

**IMPORTANT: `process.env` in Client Components**

In Next.js 14 App Router, `process.env.NEXT_PUBLIC_*` variables **do not work reliably in client components** during production builds, even when properly configured in Vercel.

**Best Practice for Client-Side APIs (Google Maps, etc.):**

✅ **DO**: Hardcode public API keys directly in client components
```typescript
// ✅ CORRECT - Hardcode the key
<iframe src={`https://www.google.com/maps/embed/v1/place?key=AIzaSy...&q=${address}`} />
```

❌ **DON'T**: Use process.env in client components
```typescript
// ❌ INCORRECT - Won't work in production
<iframe src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${address}`} />
```

**Why This Is Safe:**
- API keys restricted by HTTP referrers are **designed to be public**
- Google/Stripe/etc. expect these keys to be visible in browser source
- HTTP referrer restrictions prevent unauthorized use
- Standard industry practice (used by Google, Stripe, Vercel, etc.)

**Google Maps API Key Configuration:**
- Key: `AIzaSyDADvWmeRywpjT0oP_Fa8WrxV0Lnt-bEaw`
- Restrictions: HTTP referrers
  - `http://localhost:3001/*`
  - `https://www.valeamax.com/*`
  - `https://*.valeamax.com/*`
  - `https://*.vercel.app/*`
- Enabled APIs: Maps Embed API

---

## 📝 Naming Conventions

### Files
- **Components**: PascalCase (e.g., `InspectionForm.tsx`)
- **Services**: camelCase (e.g., `inspection.service.ts`)
- **Types**: camelCase (e.g., `inspection.types.ts`)
- **Constants**: camelCase (e.g., `inspection.constants.ts`)

### Variables/Functions
- **camelCase** for variables and functions
- **PascalCase** for components and types
- **UPPER_SNAKE_CASE** for true constants

### Translation Keys
- **Dot notation**: `inspection.form.address`
- **Nested structure**: Group by feature/context
- **Descriptive names**: Clear, concise, meaningful

---

## ⚡ Quick Reference

### Common Imports
```typescript
// i18n
import { useTranslations } from 'next-intl';

// MUI Components
import { Box, Card, CardContent, Typography, Button, TextField, Grid } from '@mui/material';

// MUI Icons
import { Home, Add, Save, Delete, Edit, ArrowBack } from '@mui/icons-material';

// Navigation
import { useRouter } from 'next/navigation';

// Supabase
import { createClient } from '@/lib/supabase/client';
```

### Creating New Pages
```typescript
// app/[locale]/inspection/page.tsx
import { useTranslations } from 'next-intl';

export default function InspectionPage() {
  const t = useTranslations('inspection');

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">{t('title')}</Typography>
      {/* Content */}
    </Box>
  );
}
```

---

## 📋 Appraisal Sections & Data Access

### Section IDs and Data Structure

**IMPORTANT**: When accessing appraisal section data, use the correct section ID keys.

The `appraisals` table stores all section data in the `form_data` JSONB column:
```typescript
// appraisals.form_data structure:
{
  "sujet": { subject: {...}, completed: true },
  "exec_summary": { ... },
  "methode_parite": { subject: {...}, comparables: [...], customLabels: {} },
  "adjustments_calculator": { comparables: [...], defaultRates: {...} },
  // ... other sections
}
```

### Common Section IDs
- `sujet` - Subject property (Page 1)
- `exec_summary` - Executive summary
- `methode_parite` - Direct Comparison / Parity Method (NOT `direct_comparison`)
- `adjustments_calculator` - Adjustments Calculator tool
- `voisinage` - Neighborhood
- `emplacement` - Location
- `ameliorations` - Improvements
- `utilisation_optimale` - Highest and Best Use
- `historique_ventes` - Sales History

### Accessing Section Data in Parent Components

In `app/[locale]/evaluations/[id]/page.tsx`:

```typescript
// ✅ CORRECT - Use sectionsDataRef for most up-to-date data
const directComparisonData = sectionsDataRef.current.methode_parite || {};

// ❌ WRONG - Using wrong key name
const directComparisonData = sectionsDataRef.current.direct_comparison || {};

// ✅ CORRECT - sectionsDataRef.current is more up-to-date than sectionsData state
directComparisonData={sectionsDataRef.current.methode_parite || {}}

// ⚠️ May be stale - sectionsData state might not have latest changes
directComparisonData={sectionsData.methode_parite || {}}
```

**Why use `sectionsDataRef.current`?**
- React state (`sectionsData`) may be stale due to batching
- The ref (`sectionsDataRef.current`) is updated immediately in `handleSectionChange()`
- Tool tabs and cross-section data access should use the ref for real-time data

---

## 🎯 Current Project: Évaluations (Appraisals) Module

### Key Features
- **Tablet-optimized** UI for field inspections
- **6 categories**: Pièces (25%), Bâtiment (25%), Garage (15%), Mécanique (15%), Extérieur (20%), Divers (0% optional)
- **Progress tracking**: Real-time completion percentage
- **Room-by-room inspection**: Floor selection → Room selection → Material selection
- **JSONB storage**: Flexible data structure for inspection details

### Critical Constants (DO NOT MODIFY WITHOUT APPROVAL)
- `INSPECTION_CATEGORIES` - Category definitions with colors, icons, weights
- `ROOMS_BY_FLOOR` - Room types per floor
- `BUILDING_OPTIONS` - Building inspection subcategories
- `GARAGE_OPTIONS`, `MECHANICAL_OPTIONS`, `EXTERIEUR_OPTIONS` - Category-specific options

---

## 🚫 What NOT to Do

❌ **Don't** create separate databases
❌ **Don't** hardcode strings (use i18n)
❌ **Don't** use inline CSS or external stylesheets
❌ **Don't** ignore TypeScript errors
❌ **Don't** create new patterns when existing ones work
❌ **Don't** add emojis unless explicitly requested
❌ **Don't** over-engineer simple solutions
❌ **Don't** create documentation files unprompted

---

## ✅ Always Remember

✅ **Think hard, code simple**
✅ **Use i18n for ALL text (FR + EN)**
✅ **Follow existing patterns**
✅ **Keep code minimal and clean**
✅ **Test in both languages**
✅ **Use Material-UI consistently**
✅ **Single Supabase database**
✅ **Tablet-friendly UI**
✅ **The fewer lines, the better**

---

**Last Updated**: 2025-10-09
**Project**: Valea Max - Real Estate Appraisal Platform
**Version**: 2.3+
