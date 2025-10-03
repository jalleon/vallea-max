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
      properties: {
        Row: {
          id: string
          organization_id: string | null
          created_by: string | null
          [key: string]: any
        }
        Insert: {
          id?: string
          organization_id?: string | null
          created_by?: string | null
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
    }
  }
}
