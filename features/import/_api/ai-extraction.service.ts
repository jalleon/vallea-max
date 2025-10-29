/**
 * AI-powered document extraction service using DeepSeek
 */

import OpenAI from 'openai';
import { ExtractedPropertyData, DocumentType } from '../types/import.types';

/**
 * System prompts for different document types
 */
const SYSTEM_PROMPTS: Record<DocumentType, string> = {
  mls_listing: `You are a real estate data extraction assistant. The user will provide text from an MLS/Matrix property listing. Extract all property information and return it in JSON format.

EXAMPLE INPUT:
Address 15 Boul. La Fayette, app. 1408, Longueuil (Le Vieux-Longueuil), J4K 0B2  Price: 435,000$  Property Type: Appartement  No Centris: 12345678
vendu en 13 jours. Superficie du terrain : 1,000 m2. Superficie privée : 800 m2. Année de construction : 2010. évaluation du terrain: 14 924$. évaluation du batiment: 120 000$.
Évaluation totale : 435 000$. Frais de copropriété : 0$. Taxe scolaire : 142$.
Date PA acceptée : 2023-05-01. Nombre de pièces (hors sol): 2. Nbre SDB + SE: 1
Allée: 2. Garage: 1. Abri d'auto: 1. Inclusions: Frigidaire, cuisinière et laveuse/sécheuse. Piscine: Oui.
Foyer-Poêle: 1. Stat. (total): Garage (1)

EXAMPLE JSON OUTPUT:
{
  "address": "15 Boul. La Fayette, app. 1408, Longueuil (Le Vieux-Longueuil), J4K 0B2",
  "sellPrice": 435000,
  "propType": "Appartement",
  "numeroMLS": "12345678",
  "hasCentris": true,
  "daysOnMarket": 13,
  "surface": 1000,
  "privateSurface": 800,
  "yearBuilt": 2010,
  "terrainValue": 14924,
  "batimentValue": 120000,
  "totalValue": 435000,
  "copropTax": 0,
  "schoolTax": 142,
  "acceptanceDate": "2023-05-01",
  "roomsAboveGround": 2,
  "bathrooms": 1,
  "walkways": 2,
  "garages": 1,
  "carport": 1,
  "inclusions": "Frigidaire, cuisinière et laveuse/sécheuse",
  "pool": true,
  "foyerPoele": 1
}

Extract all available fields. Use null for missing values. Be precise with numbers and dates.`,

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
