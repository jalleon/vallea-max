export interface NarrativeSnippet {
  id: string;
  category: string;
  title: string;
  content: string;
  language: 'fr' | 'en';
}

export const NARRATIVE_SNIPPETS_FR: NarrativeSnippet[] = [
  // Voisinage / Quartier
  {
    id: 'neighborhood_residential_fr',
    category: 'neighborhood',
    title: 'Quartier résidentiel établi',
    content: `Le bien-sujet est situé dans un quartier résidentiel bien établi, caractérisé principalement par des maisons unifamiliales construites entre [ANNÉES]. Le secteur bénéficie d'un aménagement paysager mature, de propriétés bien entretenues et d'un profil démographique stable. Les services municipaux comprennent l'aqueduc, les égouts, l'électricité et le gaz naturel. Le quartier profite de la proximité d'écoles, de parcs et d'commodités commerciales.`,
    language: 'fr'
  },
  {
    id: 'neighborhood_urban_fr',
    category: 'neighborhood',
    title: 'Quartier urbain mixte',
    content: `La propriété est située dans un district urbain à usage mixte présentant une combinaison d'usages résidentiels, commerciaux et de bureaux. Le secteur a connu un développement important au cours des dernières années, avec de nouveaux projets de condominiums et d'établissements commerciaux contribuant à la revitalisation du quartier. L'accès au transport en commun est excellent, avec des stations de métro et des lignes d'autobus à distance de marche.`,
    language: 'fr'
  },
  {
    id: 'neighborhood_suburban_fr',
    category: 'neighborhood',
    title: 'Développement de banlieue',
    content: `Le bien-sujet est situé dans un quartier résidentiel en développement en périphérie de [VILLE]. Le secteur est caractérisé par une construction résidentielle récente, incluant des maisons unifamiliales et des complexes de maisons en rangée. Les infrastructures sont modernes et complètes. Le quartier attire les familles recherchant un logement récent dans un cadre de banlieue avec accès aux écoles et aux parcs.`,
    language: 'fr'
  },

  // Conditions du marché
  {
    id: 'market_balanced_fr',
    category: 'market_conditions',
    title: 'Marché équilibré',
    content: `Le marché immobilier local a démontré des conditions équilibrées au cours des 12 derniers mois. L'offre et la demande sont relativement égales, résultant en des prix stables et des délais de vente modérés. Les propriétés comparables se sont vendues en moyenne [X] jours, avec des prix de vente se regroupant autour des prix demandés. Les indicateurs du marché suggèrent que ni les acheteurs ni les vendeurs n'ont un avantage significatif dans les négociations.`,
    language: 'fr'
  },
  {
    id: 'market_sellers_fr',
    category: 'market_conditions',
    title: 'Marché de vendeurs',
    content: `Les conditions actuelles du marché favorisent les vendeurs, avec une forte demande et un inventaire limité. Les propriétés comparables se vendent rapidement, souvent avec plusieurs offres et des prix de vente dépassant les prix demandés. Les délais de vente moyens sont de [X] jours, bien en dessous de la norme historique. Ce marché de vendeurs est alimenté par [faible inventaire / forte demande / taux d'intérêt bas / croissance économique].`,
    language: 'fr'
  },
  {
    id: 'market_buyers_fr',
    category: 'market_conditions',
    title: 'Marché d\'acheteurs',
    content: `Le marché favorise actuellement les acheteurs, avec des niveaux d'inventaire dépassant les taux d'absorption. Les propriétés prennent plus de temps à se vendre, avec une moyenne de [X] jours sur le marché, et plusieurs vendeurs offrent des concessions ou acceptent des offres en dessous du prix demandé. Cette condition de marché d'acheteurs est attribuée à [inventaire élevé / incertitude économique / facteurs saisonniers / changements démographiques].`,
    language: 'fr'
  },

  // Utilisation optimale
  {
    id: 'highest_best_use_current_fr',
    category: 'highest_best_use',
    title: 'Utilisation actuelle = optimale',
    content: `L'utilisation optimale du bien-sujet est la poursuite de son usage résidentiel actuel. Cette conclusion est basée sur les critères suivants : (1) Légalement permis : L'usage résidentiel actuel est conforme aux règlements de zonage; (2) Physiquement possible : Le site convient au développement résidentiel; (3) Financièrement réalisable : L'usage résidentiel génère un rendement raisonnable; (4) Maximalement productif : Aucun usage alternatif ne résulterait en une valeur supérieure. Par conséquent, les améliorations existantes représentent l'utilisation optimale.`,
    language: 'fr'
  },
  {
    id: 'highest_best_use_redevelopment_fr',
    category: 'highest_best_use',
    title: 'Potentiel de redéveloppement',
    content: `Bien que les améliorations actuelles remplissent une fonction utile, l'utilisation optimale du bien-sujet pourrait être le redéveloppement pour un usage résidentiel de plus haute densité ou à usage mixte, sous réserve d'approbations de zonage. L'emplacement, la taille et le potentiel de zonage de la propriété supportent la faisabilité économique d'un tel redéveloppement. Toutefois, aux fins de cette évaluation, la propriété est évaluée dans son état actuel, car la démolition et le redéveloppement nécessiteraient un investissement en capital important et des approbations réglementaires.`,
    language: 'fr'
  },

  // Clauses de réserve
  {
    id: 'disclaimer_standard_fr',
    category: 'disclaimer',
    title: 'Clause de réserve standard',
    content: `Cette évaluation est assujettie aux hypothèses et conditions limitatives contenues dans ce rapport. La conclusion de valeur est basée sur l'information et les conditions de marché existant à la date effective de l'évaluation. L'évaluateur n'assume aucune responsabilité pour les facteurs économiques ou physiques qui pourraient affecter les opinions de valeur après la date d'évaluation.`,
    language: 'fr'
  },
  {
    id: 'disclaimer_hypothetical_fr',
    category: 'disclaimer',
    title: 'Condition hypothétique',
    content: `Cette évaluation repose sur la condition hypothétique que [DÉCRIRE LA CONDITION]. Cette condition hypothétique pourrait affecter l'assignation du résultat d'évaluation; par conséquent, la valeur d'opinion pourrait être différente si la condition hypothétique n'était pas applicable.`,
    language: 'fr'
  }
];

export const NARRATIVE_SNIPPETS_EN: NarrativeSnippet[] = [
  // Neighborhood
  {
    id: 'neighborhood_residential_en',
    category: 'neighborhood',
    title: 'Established Residential',
    content: `The subject property is located in a well-established residential neighborhood characterized by predominantly single-family homes built between [YEARS]. The area features mature landscaping, well-maintained properties, and a stable demographic profile. Municipal services include water, sewer, electricity, and natural gas. The neighborhood benefits from proximity to schools, parks, and commercial amenities.`,
    language: 'en'
  },
  {
    id: 'neighborhood_urban_en',
    category: 'neighborhood',
    title: 'Urban Mixed-Use',
    content: `The property is situated in an urban mixed-use district featuring a combination of residential, commercial, and office uses. The area has experienced significant redevelopment in recent years, with newer condominium projects and commercial establishments contributing to neighborhood revitalization. Public transit access is excellent, with metro and bus routes within walking distance.`,
    language: 'en'
  },
  {
    id: 'neighborhood_suburban_en',
    category: 'neighborhood',
    title: 'Suburban Development',
    content: `The subject is located in a developing suburban neighborhood on the periphery of [CITY]. The area is characterized by recent residential construction, including single-family homes and townhouse complexes. Infrastructure is modern and complete. The neighborhood appeals to families seeking newer housing in a suburban setting with access to schools and parks.`,
    language: 'en'
  },

  // Market Conditions
  {
    id: 'market_balanced_en',
    category: 'market_conditions',
    title: 'Balanced Market',
    content: `The local real estate market has shown balanced conditions over the past 12 months. Supply and demand are relatively equal, resulting in stable pricing and moderate days on market. Comparable properties have sold in an average of [X] days, with sale prices clustering around asking prices. Market indicators suggest neither buyers nor sellers have significant leverage in negotiations.`,
    language: 'en'
  },
  {
    id: 'market_sellers_en',
    category: 'market_conditions',
    title: "Seller's Market",
    content: `Current market conditions favor sellers, with strong demand and limited inventory. Comparable properties are selling quickly, often with multiple offers and sale prices exceeding asking prices. Days on market average [X] days, well below the historical norm. This seller's market is driven by [low inventory / high demand / low interest rates / economic growth].`,
    language: 'en'
  },
  {
    id: 'market_buyers_en',
    category: 'market_conditions',
    title: "Buyer's Market",
    content: `The market currently favors buyers, with inventory levels exceeding absorption rates. Properties are taking longer to sell, averaging [X] days on market, and many sellers are offering concessions or accepting offers below asking price. This buyer's market condition is attributed to [high inventory / economic uncertainty / seasonal factors / changing demographics].`,
    language: 'en'
  },

  // Highest and Best Use
  {
    id: 'highest_best_use_current_en',
    category: 'highest_best_use',
    title: 'Current Use is Highest & Best',
    content: `The highest and best use of the subject property is for continued residential use as currently improved. This conclusion is based on the following criteria: (1) Legally Permissible: The current residential use conforms to zoning regulations; (2) Physically Possible: The site is suitable for residential development; (3) Financially Feasible: Residential use generates a reasonable return; (4) Maximally Productive: No alternative use would result in higher value. Therefore, the existing improvements represent the highest and best use.`,
    language: 'en'
  },
  {
    id: 'highest_best_use_redevelopment_en',
    category: 'highest_best_use',
    title: 'Redevelopment Potential',
    content: `While the current improvements serve a functional purpose, the highest and best use of the subject property may be redevelopment for higher-density residential or mixed-use purposes, subject to zoning approvals. The property's location, size, and zoning potential support the economic feasibility of such redevelopment. However, for purposes of this appraisal, the property is valued as currently improved, as demolition and redevelopment would require significant capital investment and regulatory approvals.`,
    language: 'en'
  },

  // Disclaimers
  {
    id: 'disclaimer_standard_en',
    category: 'disclaimer',
    title: 'Standard Disclaimer',
    content: `This appraisal is subject to the assumptions and limiting conditions contained in this report. The value conclusion is based on the information and market conditions existing as of the effective date of the appraisal. The appraiser assumes no responsibility for economic or physical factors that may affect the opinions of value after the date of value.`,
    language: 'en'
  },
  {
    id: 'disclaimer_hypothetical_en',
    category: 'disclaimer',
    title: 'Hypothetical Condition',
    content: `This appraisal is based upon the hypothetical condition that [DESCRIBE CONDITION]. This hypothetical condition could affect the assignment results; therefore, the value opinion may be different if the hypothetical condition were not applicable.`,
    language: 'en'
  }
];

// Helper function to get snippets by category and language
export function getSnippetsByCategory(category: string, language: 'fr' | 'en' = 'fr'): NarrativeSnippet[] {
  const snippets = language === 'fr' ? NARRATIVE_SNIPPETS_FR : NARRATIVE_SNIPPETS_EN;
  return snippets.filter(snippet => snippet.category === category);
}

// Helper function to get all categories
export function getSnippetCategories(language: 'fr' | 'en' = 'fr'): string[] {
  const snippets = language === 'fr' ? NARRATIVE_SNIPPETS_FR : NARRATIVE_SNIPPETS_EN;
  const categories = new Set(snippets.map(s => s.category));
  return Array.from(categories);
}

// Helper function to get snippet by ID
export function getSnippetById(id: string, language: 'fr' | 'en' = 'fr'): NarrativeSnippet | undefined {
  const snippets = language === 'fr' ? NARRATIVE_SNIPPETS_FR : NARRATIVE_SNIPPETS_EN;
  return snippets.find(snippet => snippet.id === id);
}
