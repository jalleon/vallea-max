export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          subscription_tier: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subscription_tier?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subscription_tier?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          organization_id: string | null
          role: 'admin' | 'appraiser' | 'viewer'
          preferences: Json
          created_at: string
          can_use_own_api_keys: boolean
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          organization_id?: string | null
          role?: 'admin' | 'appraiser' | 'viewer'
          preferences?: Json
          created_at?: string
          can_use_own_api_keys?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          organization_id?: string | null
          role?: 'admin' | 'appraiser' | 'viewer'
          preferences?: Json
          created_at?: string
          can_use_own_api_keys?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          organization_name: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          organization_name?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          organization_name?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      email_verifications: {
        Row: {
          id: string
          email: string
          full_name: string
          organization_name: string | null
          temp_password: string
          verification_token: string
          locale: string
          expires_at: string
          verified: boolean
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          organization_name?: string | null
          temp_password: string
          verification_token: string
          locale: string
          expires_at: string
          verified?: boolean
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          organization_name?: string | null
          temp_password?: string
          verification_token?: string
          locale?: string
          expires_at?: string
          verified?: boolean
          verified_at?: string | null
          created_at?: string
        }
      }
      field_history: {
        Row: {
          id: string
          user_id: string
          field_name: string
          field_value: string
          usage_count: number
          last_used: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          field_name: string
          field_value: string
          usage_count?: number
          last_used?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          field_name?: string
          field_value?: string
          usage_count?: number
          last_used?: string
          created_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          organization_id: string
          created_by: string
          adresse: string
          ville: string | null
          municipalite: string | null
          code_postal: string | null
          province: string | null
          prix_vente: number | null
          prix_demande: number | null
          date_vente: string | null
          status: string | null
          type_propriete: string | null
          genre_propriete: string | null
          annee_construction: number | null
          zonage: string | null
          superficie_terrain_m2: number | null
          superficie_terrain_pi2: number | null
          frontage_m2: number | null
          profondeur_m2: number | null
          frontage_pi2: number | null
          profondeur_pi2: number | null
          superficie_habitable_m2: number | null
          superficie_habitable_pi2: number | null
          nombre_chambres: number | null
          salle_bain: number | null
          salle_eau: number | null
          stationnement: string | null
          dimension_garage: string | null
          type_sous_sol: string | null
          toiture: string | null
          ameliorations_hors_sol: string | null
          numero_mls: string | null
          date_vente_precedente: string | null
          prix_vente_precedente: number | null
          media_references: Json
          source: string | null
          notes: string | null
          is_template: boolean
          is_shared: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          created_by: string
          adresse: string
          ville?: string | null
          municipalite?: string | null
          code_postal?: string | null
          province?: string | null
          prix_vente?: number | null
          prix_demande?: number | null
          date_vente?: string | null
          status?: string | null
          type_propriete?: string | null
          genre_propriete?: string | null
          annee_construction?: number | null
          zonage?: string | null
          superficie_terrain_m2?: number | null
          superficie_terrain_pi2?: number | null
          frontage_m2?: number | null
          profondeur_m2?: number | null
          frontage_pi2?: number | null
          profondeur_pi2?: number | null
          superficie_habitable_m2?: number | null
          superficie_habitable_pi2?: number | null
          nombre_chambres?: number | null
          salle_bain?: number | null
          salle_eau?: number | null
          stationnement?: string | null
          dimension_garage?: string | null
          type_sous_sol?: string | null
          toiture?: string | null
          ameliorations_hors_sol?: string | null
          numero_mls?: string | null
          date_vente_precedente?: string | null
          prix_vente_precedente?: number | null
          media_references?: Json
          source?: string | null
          notes?: string | null
          is_template?: boolean
          is_shared?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          created_by?: string
          adresse?: string
          ville?: string | null
          municipalite?: string | null
          code_postal?: string | null
          province?: string | null
          prix_vente?: number | null
          prix_demande?: number | null
          date_vente?: string | null
          status?: string | null
          type_propriete?: string | null
          genre_propriete?: string | null
          annee_construction?: number | null
          zonage?: string | null
          superficie_terrain_m2?: number | null
          superficie_terrain_pi2?: number | null
          frontage_m2?: number | null
          profondeur_m2?: number | null
          frontage_pi2?: number | null
          profondeur_pi2?: number | null
          superficie_habitable_m2?: number | null
          superficie_habitable_pi2?: number | null
          nombre_chambres?: number | null
          salle_bain?: number | null
          salle_eau?: number | null
          stationnement?: string | null
          dimension_garage?: string | null
          type_sous_sol?: string | null
          toiture?: string | null
          ameliorations_hors_sol?: string | null
          numero_mls?: string | null
          date_vente_precedente?: string | null
          prix_vente_precedente?: number | null
          media_references?: Json
          source?: string | null
          notes?: string | null
          is_template?: boolean
          is_shared?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      appraisals: {
        Row: {
          id: string
          organization_id: string
          appraiser_id: string
          subject_property_id: string
          type: 'RPS' | 'NAS' | 'Insurance' | 'Custom'
          status: 'draft' | 'in_progress' | 'completed' | 'archived'
          form_data: Json
          final_value: number | null
          valuation_method: 'sales_comparison' | 'cost_approach' | 'income_approach' | null
          report_template: Json
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          appraiser_id: string
          subject_property_id: string
          type: 'RPS' | 'NAS' | 'Insurance' | 'Custom'
          status?: 'draft' | 'in_progress' | 'completed' | 'archived'
          form_data?: Json
          final_value?: number | null
          valuation_method?: 'sales_comparison' | 'cost_approach' | 'income_approach' | null
          report_template?: Json
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          appraiser_id?: string
          subject_property_id?: string
          type?: 'RPS' | 'NAS' | 'Insurance' | 'Custom'
          status?: 'draft' | 'in_progress' | 'completed' | 'archived'
          form_data?: Json
          final_value?: number | null
          valuation_method?: 'sales_comparison' | 'cost_approach' | 'income_approach' | null
          report_template?: Json
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      comparables: {
        Row: {
          id: string
          appraisal_id: string
          property_id: string
          adjustments: Json
          adjusted_value: number | null
          weight: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          appraisal_id: string
          property_id: string
          adjustments?: Json
          adjusted_value?: number | null
          weight?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          appraisal_id?: string
          property_id?: string
          adjustments?: Json
          adjusted_value?: number | null
          weight?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          action: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          action: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}