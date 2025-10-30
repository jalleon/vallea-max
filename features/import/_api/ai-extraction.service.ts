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

CRITICAL RULES:
1. Remove ALL formatting from numbers (commas, spaces, $, m², pi²)
2. Convert ALL monetary values to numbers only (no $ sign)
3. Extract FULL address including unit/apt number, city, municipality, postal code
4. Dates must be YYYY-MM-DD format
5. Areas can be in m² or pi² - extract the NUMBER only
6. For yes/no fields: true/false or 1/0
7. Use null for missing/unavailable fields
8. Property type: use exact French terms (Unifamiliale, Condo, Plex, Commercial, etc.)

FIELD MAPPING GUIDE:
- "Prix de vente" / "Vendu" / "Prix" → sellPrice
- "Prix demandé" / "Inscrit à" → askingPrice
- "No Centris" / "No MLS" / "Numéro" → numeroMLS
- "Jours sur marché" / "DOM" / "vendu en X jours" → daysOnMarket
- "Superficie terrain" / "Lot" → surface (in m²)
- "Superficie habitable" / "Living area" → livingArea (in pi²)
- "Chambres" / "Ch." / "CAC" → bedrooms
- "Salles de bain" / "SDB" → bathrooms
- "Pièces hors-sol" / "Rooms" → roomsAboveGround
- "Éval. terrain" → terrainValue
- "Éval. bâtiment" → batimentValue
- "Éval. municipale totale" → totalValue
- "Matricule" → matricule
- "Taxes scolaires" → schoolTax
- "Taxes municipales" → municipalTax
- "Frais condo" / "Frais copropriété" → copropTax
- "Stationnement" / "Garage" / "Allée" → garages, carport, parkingSpaces
- "Inclusions" / "Équipements inclus" → inclusions
- "Piscine" → pool (true if mentioned)

EXAMPLE 1 - CONDO:
INPUT: "Magnifique condo 15 Boul. La Fayette, app. 1408, Longueuil (Le Vieux-Longueuil), J4K 0B2. Prix de vente: 435,000$. No Centris: 12345678. Vendu en 13 jours. Superficie privée: 800 pi². Année construction: 2010. Évaluation terrain: 14,924$, bâtiment: 120,000$, totale: 134,924$. Frais condo: 285$/mois. Taxes scolaires: 142$. Date PA: 2023-05-01. 2 chambres, 1 SDB. Inclusions: Frigidaire, cuisinière, laveuse-sécheuse. Stationnement intérieur (1)."

OUTPUT:
{
  "address": "15 Boul. La Fayette, app. 1408, Longueuil (Le Vieux-Longueuil), J4K 0B2",
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
  "terrainValue": 14924,
  "batimentValue": 120000,
  "totalValue": 134924,
  "copropTax": 285,
  "schoolTax": 142,
  "acceptanceDate": "2023-05-01",
  "bedrooms": 2,
  "bathrooms": 1,
  "parkingSpaces": 1,
  "inclusions": "Frigidaire, cuisinière, laveuse-sécheuse"
}

EXAMPLE 2 - UNIFAMILIALE:
INPUT: "Superbe unifamiliale au 2457 Rue des Érables, Brossard, J4Y 2K3. Prix: 749,500$. MLS: 98765432. Terrain: 5,000 pi² (464 m²). Habitable: 2,150 pi². 4 CAC, 2 SDB + 1 SE. Piscine creusée chauffée. Garage double attaché. Année: 1998. Taxes municipales: 4,250$. Taxes scolaires: 580$."

OUTPUT:
{
  "address": "2457 Rue des Érables, Brossard, J4Y 2K3",
  "city": "Brossard",
  "postalCode": "J4Y 2K3",
  "sellPrice": 749500,
  "propType": "Unifamiliale",
  "numeroMLS": "98765432",
  "hasCentris": true,
  "surface": 464,
  "livingArea": 2150,
  "yearBuilt": 1998,
  "municipalTax": 4250,
  "schoolTax": 580,
  "bedrooms": 4,
  "bathrooms": 2,
  "garages": 2,
  "pool": true,
  "inclusions": "Piscine creusée chauffée"
}

EXAMPLE 3 - PLEX:
INPUT: "Triplex bien situé 850-852-854 Ave. Centrale, Montréal (Rosemont), H1X 2B5. Demandé: 895,000$. Centris 11223344. 3 logements 5½. Revenus: 2,850$/mois. Terrain: 3,200 pi². Bâti: 1985. Matricule: 6543-21-9876. Éval. mun. 2024: Terrain 185,000$, Bâtiment 412,000$, Total 597,000$."

OUTPUT:
{
  "address": "850-852-854 Ave. Centrale, Montréal (Rosemont), H1X 2B5",
  "city": "Montréal",
  "municipality": "Rosemont",
  "postalCode": "H1X 2B5",
  "askingPrice": 895000,
  "propType": "Plex",
  "numeroMLS": "11223344",
  "hasCentris": true,
  "surface": 297,
  "yearBuilt": 1985,
  "matricule": "6543-21-9876",
  "terrainValue": 185000,
  "batimentValue": 412000,
  "totalValue": 597000,
  "roomsAboveGround": 15
}

IMPORTANT: Return ONLY the JSON object. No explanations, no markdown, no extra text. Extract ALL available fields from the document.`,

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
   */
  async extractFromText(
    text: string,
    documentType: DocumentType
  ): Promise<ExtractedPropertyData> {
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

      // Return the extracted data (handle both wrapped and unwrapped formats)
      return parsed.infos?.[0] || parsed;
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
