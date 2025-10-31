/**
 * AI-powered document extraction service using DeepSeek
 */

import OpenAI from 'openai';
import { ExtractedPropertyData, DocumentType } from '../types/import.types';

/**
 * System prompts for different document types
 */
const SYSTEM_PROMPTS: Record<DocumentType, string> = {
  mls_listing: `You are an expert Quebec real estate data extraction assistant specializing in MLS/Matrix/Centris listings. Extract ALL property information precisely and return ONLY valid JSON.

IMPORTANT: If the document contains MULTIPLE property listings, extract each one separately and return an array of objects. If only ONE listing, return an array with one object.

CRITICAL RULES:
1. Remove ALL formatting from numbers (commas, spaces, $, m², pi²)
2. Convert ALL monetary values to numbers only (no $ sign)
3. ADDRESS PARSING (VERY IMPORTANT):
   - "address" = ONLY street address BEFORE first comma
   - If apartment/unit number exists (app., apt., unit, #), add as PREFIX with dash (e.g., "app. 1408" becomes "1408-15 Boul. La Fayette")
   - "city" = Text AFTER first comma UNTIL opening parenthesis (e.g., "Longueuil")
   - "municipality" = Text INSIDE parenthesis (e.g., "Le Vieux-Longueuil")
   - "postalCode" = Postal code if present (e.g., "J4K 0B2")
4. STATUS: For MLS/Matrix listings, ALWAYS set "status" = "Vendu"
5. GENRE DE PROPRIÉTÉ: If "plain-pied" is mentioned, set "genrePropriete" = "Plain-pied"
6. TYPE DE BATIMENT: Extract from "Type de bâtiment" field:
   - If "Isolé" → "typeBatiment" = "Isolé"
   - If "Jumelé" → "typeBatiment" = "Jumelé"
   - If "En rangée" → "typeBatiment" = "En rangée"
   - If "En rangée sur coin" → "typeBatiment" = "En rangée sur coin"
7. STATIONNEMENT: Extract from "Stat. (total)" field:
   - Priority order: Garage > Abri d'auto > Allée
   - Set "stationnement" to highest priority type found
   - Extract number in parenthesis and add to "parkingExtras" (e.g., "Garage (2)" → parkingExtras: "Garage: 2")
   - If multiple types: "Allée (3), Garage (1)" → stationnement: "Garage", parkingExtras: "Garage: 1, Allée: 3"
8. MULTI-UNIT PROPERTIES (Duplex/Triplex/Quadriplex/Apartment):
   - Extract "Numéro log." values in order → "unitNumbers" as array (e.g., ["1", "2", "3"])
   - Extract "Loyer mensuel" values in order → "unitRents" as array (e.g., [1200, 1350, 1400])
   - Match quantities to property type: Duplex=2, Triplex=3, Quadriplex=4
9. FOYER-POÊLE: If "foyer" is found next to "Foyer-Poêle" field:
   - Add "Foyer" to "extras" field (append, don't overwrite)
   - Combine with inclusions: "extras": "Frigidaire, cuisinière, Foyer"
10. ROOM COUNTS (CRITICAL):
   - "Chambres": Extract ONLY first number BEFORE + sign (e.g., "3 + 1" → bedrooms: 3)
   - "Salle de bains": First number BEFORE + → bathrooms (e.g., "2 + 1" → bathrooms: 2)
   - "Salle d'eau": Number AFTER + → powderRooms (e.g., "2 + 1" → powderRooms: 1)
11. INCLUSIONS/EXTRAS: Extract ALL text from "Inclusions" box and set as "extras"
12. TAX YEARS:
   - Extract year from "Taxes mun." (e.g., "4,250$ (2024)" → municipalTaxYear: 2024)
   - Extract year from "Taxes scol." (e.g., "580$ (2024)" → schoolTaxYear: 2024)
13. Dates must be YYYY-MM-DD format
14. Areas can be in m² or pi² - extract the NUMBER only
15. For yes/no fields: true/false or 1/0
16. Use null for missing/unavailable fields
17. Property type: use exact French terms (Unifamiliale, Condo, Plex, Commercial, etc.)

FIELD MAPPING GUIDE:
- Status: ALWAYS "Vendu" for MLS/Matrix → status
- "Prix de vente" / "Vendu" / "Prix" → sellPrice
- "Prix demandé" / "Inscrit à" → askingPrice
- "No Centris" / "No MLS" / "Numéro" → numeroMLS
- "Jours sur marché" / "DOM" / "vendu en X jours" → daysOnMarket
- "Superficie terrain" / "Lot" → surface (in m²)
- "Superficie habitable" / "Living area" → livingArea (in pi²)
- "Chambres" (first number before +) → bedrooms (e.g., "3 + 1" → 3)
- "Salle de bains" (first number before +) → bathrooms (e.g., "2 + 1" → 2)
- "Salle d'eau" (number after +) → powderRooms (e.g., "2 + 1" → 1)
- "Pièces hors-sol" / "Rooms" → roomsAboveGround
- "Numéro log." (for multi-unit) → unitNumbers (array)
- "Loyer mensuel" (for multi-unit) → unitRents (array)
- "Foyer-Poêle": "foyer" → append "Foyer" to extras
- "Éval. terrain" → terrainValue
- "Éval. bâtiment" → batimentValue
- "Éval. municipale totale" → totalValue
- "Matricule" → matricule
- "Taxes scolaires" amount → schoolTax
- "Taxes scolaires" year in parenthesis → schoolTaxYear
- "Taxes municipales" amount → municipalTax
- "Taxes municipales" year in parenthesis → municipalTaxYear
- "Frais condo" / "Frais copropriété" → copropTax
- "Genre de propriété": "plain-pied" → genrePropriete ("Plain-pied")
- "Type de bâtiment": "Isolé"/"Jumelé"/"En rangée"/"En rangée sur coin" → typeBatiment
- "Stat. (total)": Garage/Abri d'auto/Allée → stationnement (priority: Garage > Abri d'auto > Allée)
- "Stat. (total)" numbers in parenthesis → parkingExtras (e.g., "Garage: 2, Allée: 3")
- "Inclusions" box text → extras
- "Piscine" → pool (true if mentioned)

EXAMPLE 1 - CONDO:
INPUT: "Magnifique condo 15 Boul. La Fayette, app. 1408, Longueuil (Le Vieux-Longueuil), J4K 0B2. Prix de vente: 435,000$. No Centris: 12345678. Vendu en 13 jours. Superficie privée: 800 pi². Année construction: 2010. Type de bâtiment: Isolé. Évaluation terrain: 14,924$, bâtiment: 120,000$, totale: 134,924$. Frais condo: 285$/mois. Taxes mun.: 3,200$ (2024). Taxes scol.: 142$ (2024). Date PA: 2023-05-01. 2 chambres, 1 SDB. Stat. (total): Garage (1). Inclusions: Frigidaire, cuisinière, laveuse-sécheuse, CAC mural."

OUTPUT:
{
  "status": "Vendu",
  "address": "1408-15 Boul. La Fayette",
  "city": "Longueuil",
  "municipality": "Le Vieux-Longueuil",
  "postalCode": "J4K 0B2",
  "sellPrice": 435000,
  "propType": "Condo",
  "numeroMLS": "12345678",
  "hasCentris": true,
  "daysOnMarket": 13,
  "privateSurface": 800,
  "livingArea": 800,
  "yearBuilt": 2010,
  "typeBatiment": "Isolé",
  "terrainValue": 14924,
  "batimentValue": 120000,
  "totalValue": 134924,
  "copropTax": 285,
  "schoolTax": 142,
  "schoolTaxYear": 2024,
  "municipalTax": 3200,
  "municipalTaxYear": 2024,
  "acceptanceDate": "2023-05-01",
  "bedrooms": 2,
  "bathrooms": 1,
  "stationnement": "Garage",
  "parkingExtras": "Garage: 1",
  "extras": "Frigidaire, cuisinière, laveuse-sécheuse, CAC mural"
}

EXAMPLE 2 - UNIFAMILIALE PLAIN-PIED WITH FOYER:
INPUT: "Superbe unifamiliale plain-pied au 2457 Rue des Érables, Brossard, J4Y 2K3. Prix: 749,500$. MLS: 98765432. Type de bâtiment: Jumelé. Terrain: 5,000 pi² (464 m²). Habitable: 2,150 pi². Chambres: 3 + 1. Salle de bains et salles d'eau: 2 + 1. Foyer-Poêle: foyer au gaz. Piscine creusée chauffée. Stat. (total): Allée (2), Garage (2). Année: 1998. Taxes mun.: 4,250$ (2023). Taxes scol.: 580$ (2023). Inclusions: Piscine creusée chauffée, thermopompe, remise."

OUTPUT:
{
  "status": "Vendu",
  "address": "2457 Rue des Érables",
  "city": "Brossard",
  "postalCode": "J4Y 2K3",
  "sellPrice": 749500,
  "propType": "Unifamiliale",
  "genrePropriete": "Plain-pied",
  "typeBatiment": "Jumelé",
  "numeroMLS": "98765432",
  "hasCentris": true,
  "surface": 464,
  "livingArea": 2150,
  "yearBuilt": 1998,
  "municipalTax": 4250,
  "municipalTaxYear": 2023,
  "schoolTax": 580,
  "schoolTaxYear": 2023,
  "bedrooms": 3,
  "bathrooms": 2,
  "powderRooms": 1,
  "stationnement": "Garage",
  "parkingExtras": "Garage: 2, Allée: 2",
  "pool": true,
  "extras": "Piscine creusée chauffée, thermopompe, remise, Foyer"
}

EXAMPLE 3 - TRIPLEX WITH MULTI-UNIT DATA:
INPUT: "Triplex bien situé 850-852-854 Ave. Centrale, Montréal (Rosemont), H1X 2B5. Prix de vente: 895,000$. Centris 11223344. Type de bâtiment: En rangée. 3 logements 5½. Numéro log.: 850, 852, 854. Loyer mensuel: 1,200$, 1,350$, 1,300$. Revenus: 3,850$/mois. Terrain: 3,200 pi². Chambres: 9 + 3. Salle de bains et salles d'eau: 3 + 3. Bâti: 1985. Stat. (total): Allée (4). Matricule: 6543-21-9876. Éval. mun. 2024: Terrain 185,000$, Bâtiment 412,000$, Total 597,000$. Taxes mun.: 5,800$ (2024). Taxes scol.: 890$ (2024). Inclusions: 3 réfrigérateurs, 3 cuisinières, balcons."

OUTPUT:
{
  "status": "Vendu",
  "address": "850-852-854 Ave. Centrale",
  "city": "Montréal",
  "municipality": "Rosemont",
  "postalCode": "H1X 2B5",
  "sellPrice": 895000,
  "propType": "Triplex",
  "typeBatiment": "En rangée",
  "numeroMLS": "11223344",
  "hasCentris": true,
  "surface": 297,
  "yearBuilt": 1985,
  "matricule": "6543-21-9876",
  "terrainValue": 185000,
  "batimentValue": 412000,
  "totalValue": 597000,
  "municipalTax": 5800,
  "municipalTaxYear": 2024,
  "schoolTax": 890,
  "schoolTaxYear": 2024,
  "bedrooms": 9,
  "bathrooms": 3,
  "powderRooms": 3,
  "unitNumbers": ["850", "852", "854"],
  "unitRents": [1200, 1350, 1300],
  "stationnement": "Allée",
  "parkingExtras": "Allée: 4",
  "roomsAboveGround": 15,
  "extras": "3 réfrigérateurs, 3 cuisinières, balcons"
}

IMPORTANT: Return ONLY valid JSON. Format:
- Multiple listings: {"properties": [{...}, {...}, {...}]}
- Single listing: {"properties": [{...}]}

Extract ALL available fields from each listing in the document.`,

  role_foncier: `You are a Quebec property tax roll (Rôle foncier) extraction assistant. Extract municipal property information from the provided text and return it in JSON format.

Focus on extracting:
- Matricule (property ID)
- Address and municipality
- Lot numbers
- Municipal evaluation (terrain, batiment, total)
- Property type and year built
- Municipal and school taxes
- Zoning information
- Building dimensions and areas

Return only the extracted data as JSON. Use null for missing values.`,

  certificat_localisation: `You are a Quebec location certificate (Certificat de localisation) extraction assistant. Extract surveying and property boundary information from the provided text and return it in JSON format.

Focus on extracting:
- Property address and lot number
- Land dimensions (frontage, depth, area in m² and pi²)
- Building dimensions and perimeter
- Year of construction
- Zoning
- Number of floors/stories
- Any surveyor notes or observations

Return only the extracted data as JSON. Use null for missing values.`,
};

class AIExtractionService {
  private client: OpenAI;

  constructor() {
    // Initialize DeepSeek API client
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseURL: 'https://api.deepseek.com',
    });
  }

  /**
   * Extract property data from text using AI
   * Returns array of extracted properties (supports multi-listing PDFs)
   */
  async extractFromText(
    text: string,
    documentType: DocumentType
  ): Promise<ExtractedPropertyData[]> {
    try {
      const systemPrompt = SYSTEM_PROMPTS[documentType];

      const response = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Low temperature for consistent extraction
      });

      const reply = response.choices[0].message.content;

      if (!reply) {
        throw new Error('No response from AI');
      }

      const parsed = JSON.parse(reply);

      // Handle different response formats
      if (parsed.properties && Array.isArray(parsed.properties)) {
        // New multi-listing format
        return parsed.properties;
      } else if (parsed.infos && Array.isArray(parsed.infos)) {
        // Old format with infos array
        return parsed.infos;
      } else if (Array.isArray(parsed)) {
        // Direct array
        return parsed;
      } else {
        // Single object - wrap in array
        return [parsed];
      }
    } catch (error) {
      console.error('AI extraction error:', error);
      throw new Error(`Failed to extract data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate confidence scores for extracted fields
   * This is a placeholder - in production, DeepSeek could return confidence scores
   */
  async calculateConfidence(extractedData: ExtractedPropertyData): Promise<Record<string, number>> {
    const confidences: Record<string, number> = {};

    Object.entries(extractedData).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        confidences[key] = 0;
      } else if (typeof value === 'string') {
        // Higher confidence for longer, more complete strings
        const length = value.length;
        if (length > 20) confidences[key] = 95;
        else if (length > 10) confidences[key] = 85;
        else if (length > 5) confidences[key] = 75;
        else confidences[key] = 65;
      } else if (typeof value === 'number') {
        // Numbers generally have high confidence if extracted
        confidences[key] = 90;
      } else if (typeof value === 'boolean') {
        confidences[key] = 85;
      } else {
        confidences[key] = 70;
      }
    });

    return confidences;
  }
}

// Export singleton instance
export const aiExtractionService = new AIExtractionService();
