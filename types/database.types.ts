export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      appraisals: {
        Row: {
          appraiser_id: string | null
          completed_at: string | null
          created_at: string | null
          final_value: number | null
          form_data: Json | null
          id: string
          organization_id: string | null
          report_template: Json | null
          status: string | null
          subject_property_id: string | null
          type: string | null
          updated_at: string | null
          valuation_method: string | null
        }
        Insert: {
          appraiser_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          final_value?: number | null
          form_data?: Json | null
          id?: string
          organization_id?: string | null
          report_template?: Json | null
          status?: string | null
          subject_property_id?: string | null
          type?: string | null
          updated_at?: string | null
          valuation_method?: string | null
        }
        Update: {
          appraiser_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          final_value?: number | null
          form_data?: Json | null
          id?: string
          organization_id?: string | null
          report_template?: Json | null
          status?: string | null
          subject_property_id?: string | null
          type?: string | null
          updated_at?: string | null
          valuation_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appraisals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisals_subject_property_id_fkey"
            columns: ["subject_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      comparables: {
        Row: {
          adjusted_value: number | null
          adjustments: Json | null
          appraisal_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          property_id: string | null
          weight: number | null
        }
        Insert: {
          adjusted_value?: number | null
          adjustments?: Json | null
          appraisal_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          weight?: number | null
        }
        Update: {
          adjusted_value?: number | null
          adjustments?: Json | null
          appraisal_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comparables_appraisal_id_fkey"
            columns: ["appraisal_id"]
            isOneToOne: false
            referencedRelation: "appraisals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparables_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      field_history: {
        Row: {
          created_at: string | null
          field_name: string
          field_value: string
          id: string
          last_used: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          field_name: string
          field_value: string
          id?: string
          last_used?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          field_name?: string
          field_value?: string
          id?: string
          last_used?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      floor_areas: {
        Row: {
          area_ft2: number
          area_m2: number
          created_at: string | null
          floor: string
          id: string
          property_id: string | null
          type: string
        }
        Insert: {
          area_ft2: number
          area_m2: number
          created_at?: string | null
          floor: string
          id?: string
          property_id?: string | null
          type: string
        }
        Update: {
          area_ft2?: number
          area_m2?: number
          created_at?: string | null
          floor?: string
          id?: string
          property_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "floor_areas_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          additional_lots: Json | null
          adresse: string
          aire_habitable_m2: number | null
          aire_habitable_pi2: number | null
          ameliorations_hors_sol: string | null
          annee_construction: number | null
          chrono_age: number | null
          code_postal: string | null
          created_at: string | null
          created_by: string | null
          date_vente: string | null
          date_vente_precedente: string | null
          dimension_garage: string | null
          eff_age: number | null
          eval_municipale_annee: string | null
          eval_municipale_batiment: number | null
          eval_municipale_terrain: number | null
          eval_municipale_total: number | null
          extras: string | null
          field_sources: Json | null
          frais_condo: number | null
          frontage_m2: number | null
          frontage_pi2: number | null
          genre_propriete: string | null
          id: string
          inspection_batiment: Json | null
          inspection_categories_completed: string[] | null
          inspection_completion: number | null
          inspection_date: string | null
          inspection_divers: Json | null
          inspection_exterieur: Json | null
          inspection_garage: Json | null
          inspection_mecanique: Json | null
          inspection_pieces: Json | null
          inspection_status: string | null
          is_shared: boolean | null
          is_template: boolean | null
          jours_sur_marche: number | null
          localisation: string | null
          lot_number: string | null
          loyer_en_place: number | null
          matricule: string | null
          media_references: Json | null
          municipalite: string | null
          nombre_chambres: number | null
          nombre_pieces: number | null
          nombre_stationnement: number | null
          notes: string | null
          numero_mls: string | null
          occupancy: string | null
          organization_id: string | null
          perimetre_batiment_m2: number | null
          perimetre_batiment_pi2: number | null
          prix_demande: number | null
          prix_vente: number | null
          prix_vente_precedente: number | null
          profondeur_m2: number | null
          profondeur_pi2: number | null
          province: string | null
          salle_bain: number | null
          salle_eau: number | null
          search_vector: unknown
          source: string | null
          stationnement: string | null
          status: string | null
          superficie_habitable_m2: number | null
          superficie_habitable_pi2: number | null
          superficie_terrain_m2: number | null
          superficie_terrain_pi2: number | null
          taxes_municipales_annee: number | null
          taxes_municipales_montant: number | null
          taxes_scolaires_annee: number | null
          taxes_scolaires_montant: number | null
          toiture: string | null
          type_batiment: string | null
          type_copropriete: string | null
          type_evaluation: string | null
          type_garage: string | null
          type_propriete: string | null
          type_sous_sol: string | null
          unit_rents: Json | null
          updated_at: string | null
          ville: string | null
          zonage: string | null
          zoning_usages_permis: string | null
        }
        Insert: {
          additional_lots?: Json | null
          adresse: string
          aire_habitable_m2?: number | null
          aire_habitable_pi2?: number | null
          ameliorations_hors_sol?: string | null
          annee_construction?: number | null
          chrono_age?: number | null
          code_postal?: string | null
          created_at?: string | null
          created_by?: string | null
          date_vente?: string | null
          date_vente_precedente?: string | null
          dimension_garage?: string | null
          eff_age?: number | null
          eval_municipale_annee?: string | null
          eval_municipale_batiment?: number | null
          eval_municipale_terrain?: number | null
          eval_municipale_total?: number | null
          extras?: string | null
          field_sources?: Json | null
          frais_condo?: number | null
          frontage_m2?: number | null
          frontage_pi2?: number | null
          genre_propriete?: string | null
          id?: string
          inspection_batiment?: Json | null
          inspection_categories_completed?: string[] | null
          inspection_completion?: number | null
          inspection_date?: string | null
          inspection_divers?: Json | null
          inspection_exterieur?: Json | null
          inspection_garage?: Json | null
          inspection_mecanique?: Json | null
          inspection_pieces?: Json | null
          inspection_status?: string | null
          is_shared?: boolean | null
          is_template?: boolean | null
          jours_sur_marche?: number | null
          localisation?: string | null
          lot_number?: string | null
          loyer_en_place?: number | null
          matricule?: string | null
          media_references?: Json | null
          municipalite?: string | null
          nombre_chambres?: number | null
          nombre_pieces?: number | null
          nombre_stationnement?: number | null
          notes?: string | null
          numero_mls?: string | null
          occupancy?: string | null
          organization_id?: string | null
          perimetre_batiment_m2?: number | null
          perimetre_batiment_pi2?: number | null
          prix_demande?: number | null
          prix_vente?: number | null
          prix_vente_precedente?: number | null
          profondeur_m2?: number | null
          profondeur_pi2?: number | null
          province?: string | null
          salle_bain?: number | null
          salle_eau?: number | null
          search_vector?: unknown
          source?: string | null
          stationnement?: string | null
          status?: string | null
          superficie_habitable_m2?: number | null
          superficie_habitable_pi2?: number | null
          superficie_terrain_m2?: number | null
          superficie_terrain_pi2?: number | null
          taxes_municipales_annee?: number | null
          taxes_municipales_montant?: number | null
          taxes_scolaires_annee?: number | null
          taxes_scolaires_montant?: number | null
          toiture?: string | null
          type_batiment?: string | null
          type_copropriete?: string | null
          type_evaluation?: string | null
          type_garage?: string | null
          type_propriete?: string | null
          type_sous_sol?: string | null
          unit_rents?: Json | null
          updated_at?: string | null
          ville?: string | null
          zonage?: string | null
          zoning_usages_permis?: string | null
        }
        Update: {
          additional_lots?: Json | null
          adresse?: string
          aire_habitable_m2?: number | null
          aire_habitable_pi2?: number | null
          ameliorations_hors_sol?: string | null
          annee_construction?: number | null
          chrono_age?: number | null
          code_postal?: string | null
          created_at?: string | null
          created_by?: string | null
          date_vente?: string | null
          date_vente_precedente?: string | null
          dimension_garage?: string | null
          eff_age?: number | null
          eval_municipale_annee?: string | null
          eval_municipale_batiment?: number | null
          eval_municipale_terrain?: number | null
          eval_municipale_total?: number | null
          extras?: string | null
          field_sources?: Json | null
          frais_condo?: number | null
          frontage_m2?: number | null
          frontage_pi2?: number | null
          genre_propriete?: string | null
          id?: string
          inspection_batiment?: Json | null
          inspection_categories_completed?: string[] | null
          inspection_completion?: number | null
          inspection_date?: string | null
          inspection_divers?: Json | null
          inspection_exterieur?: Json | null
          inspection_garage?: Json | null
          inspection_mecanique?: Json | null
          inspection_pieces?: Json | null
          inspection_status?: string | null
          is_shared?: boolean | null
          is_template?: boolean | null
          jours_sur_marche?: number | null
          localisation?: string | null
          lot_number?: string | null
          loyer_en_place?: number | null
          matricule?: string | null
          media_references?: Json | null
          municipalite?: string | null
          nombre_chambres?: number | null
          nombre_pieces?: number | null
          nombre_stationnement?: number | null
          notes?: string | null
          numero_mls?: string | null
          occupancy?: string | null
          organization_id?: string | null
          perimetre_batiment_m2?: number | null
          perimetre_batiment_pi2?: number | null
          prix_demande?: number | null
          prix_vente?: number | null
          prix_vente_precedente?: number | null
          profondeur_m2?: number | null
          profondeur_pi2?: number | null
          province?: string | null
          salle_bain?: number | null
          salle_eau?: number | null
          search_vector?: unknown
          source?: string | null
          stationnement?: string | null
          status?: string | null
          superficie_habitable_m2?: number | null
          superficie_habitable_pi2?: number | null
          superficie_terrain_m2?: number | null
          superficie_terrain_pi2?: number | null
          taxes_municipales_annee?: number | null
          taxes_municipales_montant?: number | null
          taxes_scolaires_annee?: number | null
          taxes_scolaires_montant?: number | null
          toiture?: string | null
          type_batiment?: string | null
          type_copropriete?: string | null
          type_evaluation?: string | null
          type_garage?: string | null
          type_propriete?: string | null
          type_sous_sol?: string | null
          unit_rents?: Json | null
          updated_at?: string | null
          ville?: string | null
          zonage?: string | null
          zoning_usages_permis?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_api_keys: {
        Row: {
          id: string
          provider: string
          api_key: string
          model: string
          is_active: boolean
          priority: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider: string
          api_key: string
          model: string
          is_active?: boolean
          priority?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider?: string
          api_key?: string
          model?: string
          is_active?: boolean
          priority?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          operation_type: string
          document_type: string | null
          file_size_bytes: number | null
          page_count: number | null
          credits_used: number
          provider_used: string | null
          model_used: string | null
          tokens_input: number | null
          tokens_output: number | null
          cost_estimate: number | null
          success: boolean
          error_message: string | null
          processing_time_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          operation_type: string
          document_type?: string | null
          file_size_bytes?: number | null
          page_count?: number | null
          credits_used?: number
          provider_used?: string | null
          model_used?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          cost_estimate?: number | null
          success?: boolean
          error_message?: string | null
          processing_time_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          operation_type?: string
          document_type?: string | null
          file_size_bytes?: number | null
          page_count?: number | null
          credits_used?: number
          provider_used?: string | null
          model_used?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          cost_estimate?: number | null
          success?: boolean
          error_message?: string | null
          processing_time_ms?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          status: string
          plan_type: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          status: string
          plan_type: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          status?: string
          plan_type?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          api_key_secret_enabled: boolean | null
          can_use_own_api_keys: boolean | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          organization_id: string | null
          preferences: Json | null
          role: string | null
          scan_credits_quota: number | null
          scan_credits_reset_at: string | null
          scan_credits_used: number | null
        }
        Insert: {
          api_key_secret_enabled?: boolean | null
          can_use_own_api_keys?: boolean | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          preferences?: Json | null
          role?: string | null
          scan_credits_quota?: number | null
          scan_credits_reset_at?: string | null
          scan_credits_used?: number | null
        }
        Update: {
          api_key_secret_enabled?: boolean | null
          can_use_own_api_keys?: boolean | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          preferences?: Json | null
          role?: string | null
          scan_credits_quota?: number | null
          scan_credits_reset_at?: string | null
          scan_credits_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_requests: {
        Row: {
          id: string
          email: string
          name: string
          company: string | null
          phone: string | null
          message: string | null
          locale: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          company?: string | null
          phone?: string | null
          message?: string | null
          locale?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          company?: string | null
          phone?: string | null
          message?: string | null
          locale?: string
          created_at?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          id: string
          email: string
          name: string
          locale: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          locale?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          locale?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_organization_and_admin: {
        Args: { admin_email: string; admin_name?: string; org_name: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
