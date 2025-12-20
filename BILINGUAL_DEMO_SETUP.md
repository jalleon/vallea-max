# 🌍 Bilingual Demo Setup - Valea Max

Complete bilingual demo setup with separate EN and FR accounts for professional screenshots.

---

## 📋 Demo Accounts

### 🇬🇧 English Demo Account
**For EN screenshots and demos**

- **Email:** `demo-en@valeamax.com`
- **Password:** `DemoEN2024!`
- **Name:** Sarah Mitchell
- **Organization:** Mitchell Appraisal Group
- **Properties:** 15 properties across Canada

**Property Distribution:**
- 7 properties in GTA (Greater Toronto Area)
- 5 properties in Greater Vancouver
- 3 properties in Alberta (Calgary, Edmonton)

---

### 🇫🇷 French Demo Account
**For FR screenshots and demos**

- **Email:** `demo-fr@valeamax.com`
- **Password:** `DemoFR2024!`
- **Name:** Marc Dubois
- **Organization:** Évaluations Dubois Inc.
- **Properties:** 15 properties across Quebec

**Property Distribution:**
- 7 properties in Montreal
- 5 properties in Quebec City
- 3 properties in Gatineau

---

## 🏠 Property Details

### English Properties (15 total)

#### GTA - Toronto (7 properties)
1. **88 Harbour Street, Unit 6503** - Condo, $1,150,000
2. **245 Bloor Street East** - Detached, $4,250,000
3. **2350 Yonge Street, Unit 1205** - Condo, $825,000
4. **45 The Kingsway** - Detached, $2,950,000
5. **1888 Bayview Avenue** - Duplex, $1,675,000
6. **155 Dufferin Street, Unit 901** - Condo, $625,000
7. **4285 Kingston Road** - Bungalow, $1,225,000

#### Greater Vancouver (5 properties)
8. **1288 West Georgia Street, Unit 2105** - Condo, $1,950,000
9. **2755 West 16th Avenue** - Detached, $3,850,000
10. **1455 Bellevue Avenue** (West Vancouver) - Detached, $6,250,000
11. **8888 Odlin Crescent** (Richmond) - Detached, $2,450,000
12. **305 Lonsdale Avenue, Unit 1802** (North Vancouver) - Condo, $875,000

#### Alberta (3 properties)
13. **1088 6th Avenue SW, Unit 3201** (Calgary) - Condo, $625,000
14. **45 Aspen Summit View SW** (Calgary) - Detached, $1,450,000
15. **10234 124 Street NW** (Edmonton) - Detached, $725,000

---

### French Properties (15 total)

#### Montreal (7 properties)
1. **1188 Rue de la Commune Ouest, App 2105** - Condo, $895,000
2. **4567 Avenue Coloniale** - Duplex, $1,350,000
3. **2888 Boulevard Édouard-Montpetit, App 801** - Condo, $485,000
4. **1455 Rue Sherbrooke Ouest, App 1502** - Condo, $1,250,000
5. **5678 Rue Beaubien Est** - Triplex, $925,000
6. **8234 Rue Saint-Denis** - Bungalow, $625,000
7. **1088 Boulevard Robert-Bourassa, App 3201** - Condo, $725,000

#### Quebec City (5 properties)
8. **2845 Chemin Sainte-Foy, App 905** - Condo, $425,000
9. **125 Grande Allée Est** - Detached, $875,000
10. **3456 Boulevard Laurier** - Detached, $695,000
11. **1234 Rue des Rocailles** - Duplex, $425,000
12. **567 Rue Saint-Jean, App 3** - Apartment, $285,000

#### Gatineau (3 properties)
13. **155 Rue Principale** (Aylmer) - Detached, $545,000
14. **88 Rue Laurier, App 1205** (Hull) - Condo, $325,000
15. **2345 Route 148** (Buckingham) - Bungalow, $385,000

---

## 🔧 Property Features

### Property Types Used
- ✅ Condo
- ✅ Unifamiliale (Single Family)
- ✅ Duplex
- ✅ Triplex
- ✅ Appartement
- ✅ Bungalow

### Data Sources Mixed
- ✅ `manual` - Manually entered
- ✅ `import` - Imported from external source
- ✅ `inspection` - Created from inspection

### Realistic Data
- ✅ Accurate Canadian addresses
- ✅ Real postal codes
- ✅ Market-appropriate pricing
- ✅ Proper MLS numbers (M/Q/G/C/V/A prefixes)
- ✅ Complete property details
- ✅ Status: "Vendu" (Sold)

---

## 🌍 Complete i18n Implementation

### Translation Coverage

**Library Module - 100% Bilingual:**
- ✅ Main library page (`app/[locale]/library/page.tsx`)
- ✅ PropertyForm component
- ✅ PropertyTable component
- ✅ PropertyView component
- ✅ PropertyEdit component

**Translation Keys Added:**
- 220+ keys in `messages/en.json`
- 220+ keys in `messages/fr.json`

**Namespaces:**
- `library.*` - General library labels
- `library.stats.*` - Dashboard statistics
- `library.search.*` - Search and filters
- `library.table.*` - Table headers and actions
- `library.dialogs.*` - Dialog messages
- `library.form.*` - Form fields and labels (80+ keys)
- `library.view.*` - Property view details
- `library.propertyTypes.*` - Property type translations
- `library.propertyStatus.*` - Status translations

---

## 🎯 Usage Instructions

### For English Screenshots

1. Navigate to: http://localhost:3001/en/login
2. Login with:
   - Email: `demo-en@valeamax.com`
   - Password: `DemoEN2024!`
3. Go to Library module
4. See 15 English properties from GTA, Vancouver, Alberta
5. All interface in English

### For French Screenshots

1. Navigate to: http://localhost:3001/fr/login
2. Login with:
   - Email: `demo-fr@valeamax.com`
   - Password: `DemoFR2024!`
3. Go to Library module (Bibliothèque)
4. See 15 French properties from Montreal, Quebec City, Gatineau
5. All interface in French

---

## 📝 Scripts Available

### Setup Scripts
- `scripts/setup-bilingual-demo-accounts.mjs` - Creates both demo accounts
- `scripts/seed-15-english-properties.mjs` - Seeds EN properties
- `scripts/seed-15-french-properties.mjs` - Seeds FR properties

### Legacy Scripts (Deprecated)
- `scripts/seed-toronto-properties.mjs` - Old 8 Toronto properties
- `scripts/seed-montreal-quebec-properties.mjs` - Old 8 QC properties
- `scripts/setup-demo-account.mjs` - Old single demo account

---

## ✅ Quality Checklist

### Data Separation
- ✅ Separate organizations for EN/FR
- ✅ No property mixing between accounts
- ✅ Clean screenshots without personal data

### Bilingual Support
- ✅ All labels translated
- ✅ All forms translated
- ✅ All dialogs translated
- ✅ All table headers translated
- ✅ All buttons translated
- ✅ Zero hardcoded strings

### Property Diversity
- ✅ Multiple property types
- ✅ Various price ranges
- ✅ Different sources
- ✅ Geographic distribution
- ✅ Realistic market data

---

## 🔒 Security Notes

- Demo passwords should be changed after screenshots
- Accounts are for demo/screenshot purposes only
- Keep credentials private
- Do not use for production data

---

**Created:** 2025-11-06
**Last Updated:** 2025-11-06
**Branch:** feature/library
**Status:** ✅ Complete and Ready for Screenshots
