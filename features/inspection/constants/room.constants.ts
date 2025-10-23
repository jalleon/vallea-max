/**
 * Room configuration with translation key references
 * All labels use translation keys that must be resolved at runtime using useTranslations()
 */

export interface RoomFieldConfig {
  name: string
  type: 'select' | 'multiselect' | 'text'
  translationKey: string
  options?: {
    value: string
    translationKey: string
  }[]
}

export interface RoomTypeConfig {
  id: string
  translationKey: string
  fields: RoomFieldConfig[]
}

// Material options with translation key references
export const MATERIAL_OPTIONS = {
  cabinets: [
    { value: 'melamine', translationKey: 'inspection.materials.cabinets.melamine' },
    { value: 'wood', translationKey: 'inspection.materials.cabinets.wood' },
    { value: 'lacquered', translationKey: 'inspection.materials.cabinets.lacquered' },
    { value: 'mdf', translationKey: 'inspection.materials.cabinets.mdf' },
    { value: 'other', translationKey: 'inspection.materials.cabinets.other' }
  ],
  counters: [
    { value: 'laminate', translationKey: 'inspection.materials.counters.laminate' },
    { value: 'quartz', translationKey: 'inspection.materials.counters.quartz' },
    { value: 'granite', translationKey: 'inspection.materials.counters.granite' },
    { value: 'ceramic', translationKey: 'inspection.materials.counters.ceramic' },
    { value: 'wood', translationKey: 'inspection.materials.counters.wood' },
    { value: 'stainless', translationKey: 'inspection.materials.counters.stainless' },
    { value: 'marble', translationKey: 'inspection.materials.counters.marble' },
    { value: 'other', translationKey: 'inspection.materials.counters.other' }
  ],
  backsplash: [
    { value: 'ceramic', translationKey: 'inspection.materials.backsplash.ceramic' },
    { value: 'stainless', translationKey: 'inspection.materials.backsplash.stainless' },
    { value: 'quartz', translationKey: 'inspection.materials.backsplash.quartz' },
    { value: 'granite', translationKey: 'inspection.materials.backsplash.granite' },
    { value: 'other', translationKey: 'inspection.materials.backsplash.other' }
  ],
  flooring: [
    { value: 'ceramic', translationKey: 'inspection.materials.flooring.ceramic' },
    { value: 'hardwood', translationKey: 'inspection.materials.flooring.hardwood' },
    { value: 'engineered', translationKey: 'inspection.materials.flooring.engineered' },
    { value: 'floating', translationKey: 'inspection.materials.flooring.floating' },
    { value: 'vinyl', translationKey: 'inspection.materials.flooring.vinyl' },
    { value: 'carpet', translationKey: 'inspection.materials.flooring.carpet' },
    { value: 'other', translationKey: 'inspection.materials.flooring.other' }
  ],
  walls: [
    { value: 'stucco', translationKey: 'inspection.materials.walls.stucco' },
    { value: 'wood', translationKey: 'inspection.materials.walls.wood' },
    { value: 'concrete', translationKey: 'inspection.materials.walls.concrete' },
    { value: 'brick', translationKey: 'inspection.materials.walls.brick' },
    { value: 'stone', translationKey: 'inspection.materials.walls.stone' },
    { value: 'veneer', translationKey: 'inspection.materials.walls.veneer' },
    { value: 'other', translationKey: 'inspection.materials.walls.other' }
  ],
  ceiling: [
    { value: 'drywall', translationKey: 'inspection.materials.ceiling.drywall' },
    { value: 'suspended', translationKey: 'inspection.materials.ceiling.suspended' },
    { value: 'stucco', translationKey: 'inspection.materials.ceiling.stucco' },
    { value: 'other', translationKey: 'inspection.materials.ceiling.other' }
  ]
}

// Size options
export const SIZE_OPTIONS = [
  { value: 'large', translationKey: 'inspection.sizes.large' },
  { value: 'medium', translationKey: 'inspection.sizes.medium' },
  { value: 'small', translationKey: 'inspection.sizes.small' }
]

// Fixture count options for bathrooms
export const BATHROOM_FIXTURE_OPTIONS = [
  { value: '3', translationKey: 'inspection.fixtures.3' },
  { value: '4', translationKey: 'inspection.fixtures.4' },
  { value: '5', translationKey: 'inspection.fixtures.5' },
  { value: '6', translationKey: 'inspection.fixtures.6' },
  { value: '7', translationKey: 'inspection.fixtures.7' },
  { value: '8', translationKey: 'inspection.fixtures.8' }
]

// Fixture count options for powder rooms
export const POWDER_ROOM_FIXTURE_OPTIONS = [
  { value: '1', translationKey: 'inspection.fixtures.1' },
  { value: '2', translationKey: 'inspection.fixtures.2' }
]

// Room type configurations
export const ROOM_CONFIG: Record<string, RoomTypeConfig> = {
  cuisine: {
    id: 'cuisine',
    translationKey: 'inspection.rooms.cuisine',
    fields: [
      {
        name: 'armoires',
        type: 'multiselect',
        translationKey: 'inspection.materials.cabinets.label',
        options: MATERIAL_OPTIONS.cabinets
      },
      {
        name: 'comptoirs',
        type: 'multiselect',
        translationKey: 'inspection.materials.counters.label',
        options: MATERIAL_OPTIONS.counters
      },
      {
        name: 'dosseret',
        type: 'multiselect',
        translationKey: 'inspection.materials.backsplash.label',
        options: MATERIAL_OPTIONS.backsplash
      },
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  },
  salon: {
    id: 'salon',
    translationKey: 'inspection.rooms.salon',
    fields: [
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  },
  salle_a_manger: {
    id: 'salle_a_manger',
    translationKey: 'inspection.rooms.salleAManger',
    fields: [
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  },
  chambre: {
    id: 'chambre',
    translationKey: 'inspection.rooms.chambre',
    fields: [
      {
        name: 'grandeur',
        type: 'select',
        translationKey: 'inspection.fields.size',
        options: SIZE_OPTIONS
      },
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  },
  bureau: {
    id: 'bureau',
    translationKey: 'inspection.rooms.bureau',
    fields: [
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  },
  salle_sejour: {
    id: 'salle_sejour',
    translationKey: 'inspection.rooms.salleSejour',
    fields: [
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  },
  salle_bain: {
    id: 'salle_bain',
    translationKey: 'inspection.rooms.salleBain',
    fields: [
      {
        name: 'nombreAppareils',
        type: 'select',
        translationKey: 'inspection.fields.fixtureCount',
        options: BATHROOM_FIXTURE_OPTIONS
      },
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'dosseret',
        type: 'multiselect',
        translationKey: 'inspection.materials.backsplash.label',
        options: MATERIAL_OPTIONS.backsplash
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  },
  salle_eau: {
    id: 'salle_eau',
    translationKey: 'inspection.rooms.salleEau',
    fields: [
      {
        name: 'nombreAppareils',
        type: 'select',
        translationKey: 'inspection.fields.fixtureCount',
        options: POWDER_ROOM_FIXTURE_OPTIONS
      },
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'dosseret',
        type: 'multiselect',
        translationKey: 'inspection.materials.backsplash.label',
        options: MATERIAL_OPTIONS.backsplash
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  },
  autre: {
    id: 'autre',
    translationKey: 'inspection.rooms.autre',
    fields: [
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  },
  salle_familiale: {
    id: 'salle_familiale',
    translationKey: 'inspection.rooms.salleFamiliale',
    fields: [
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  },
  buanderie: {
    id: 'buanderie',
    translationKey: 'inspection.rooms.buanderie',
    fields: [
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  },
  rangement: {
    id: 'rangement',
    translationKey: 'inspection.rooms.rangement',
    fields: [
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  },
  salle_mecanique: {
    id: 'salle_mecanique',
    translationKey: 'inspection.rooms.salleMecanique',
    fields: [
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  },
  vestibule: {
    id: 'vestibule',
    translationKey: 'inspection.rooms.vestibule',
    fields: [
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  },
  solarium: {
    id: 'solarium',
    translationKey: 'inspection.rooms.solarium',
    fields: [
      {
        name: 'plancher',
        type: 'multiselect',
        translationKey: 'inspection.materials.flooring.label',
        options: MATERIAL_OPTIONS.flooring
      },
      {
        name: 'murs',
        type: 'multiselect',
        translationKey: 'inspection.materials.walls.label',
        options: MATERIAL_OPTIONS.walls
      },
      {
        name: 'plafond',
        type: 'multiselect',
        translationKey: 'inspection.materials.ceiling.label',
        options: MATERIAL_OPTIONS.ceiling
      },
      {
        name: 'notes',
        type: 'text',
        translationKey: 'inspection.fields.notes'
      }
    ]
  }
}

// Floor options
export const FLOOR_OPTIONS = [
  { value: 'sous_sol', translationKey: 'inspection.floors.sousSol', displayName: 'Sous-sol' },
  { value: 'rdc', translationKey: 'inspection.floors.rdc', displayName: 'R.D.C.' },
  { value: 'deuxieme', translationKey: 'inspection.floors.deuxieme', displayName: '2e' },
  { value: 'troisieme', translationKey: 'inspection.floors.troisieme', displayName: '3e' }
]

// Helper function to get room types as array
export const getRoomTypes = () => Object.values(ROOM_CONFIG)

// Helper function to get room config by id
export const getRoomConfig = (roomId: string): RoomTypeConfig | undefined => {
  return ROOM_CONFIG[roomId]
}
