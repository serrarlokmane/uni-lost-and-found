
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "admin_log": {
                  Row: {
                    "action": string,"admin_id": string | null,"created_at": string,"id": number,"note": string | null,"target_id": string,"target_type": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"admin_id"?: string | null,"created_at"?: string,"id"?: never,"note"?: string | null,"target_id": string,"target_type": string
                  }
                  Update: {
                    "action"?: string,"admin_id"?: string | null,"created_at"?: string,"id"?: never,"note"?: string | null,"target_id"?: string,"target_type"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "admin_log_admin_id_fkey"
      columns: ["admin_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"claims": {
                  Row: {
                    "claimant_id": string,"created_at": string,"decided_at": string | null,"decided_by": string | null,"id": string,"message": string,"post_id": string,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "claimant_id": string,"created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"id"?: string,"message": string,"post_id": string,"status"?: string
                  }
                  Update: {
                    "claimant_id"?: string,"created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"id"?: string,"message"?: string,"post_id"?: string,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "claims_claimant_id_fkey"
      columns: ["claimant_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "claims_decided_by_fkey"
      columns: ["decided_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "claims_post_id_fkey"
      columns: ["post_id"]
isOneToOne: false
      referencedRelation: "posts"
      referencedColumns: ["id"]
    }
                  ]
                },"posts": {
                  Row: {
                    "category": string,"created_at": string,"description": string,"happened_on": string,"id": string,"location": string,"owner_id": string,"ref": number,"reject_reason": string | null,"resolved_at": string | null,"reviewed_by": string | null,"status": string,"title": string,"type": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category": string,"created_at"?: string,"description": string,"happened_on": string,"id"?: string,"location": string,"owner_id": string,"ref"?: never,"reject_reason"?: string | null,"resolved_at"?: string | null,"reviewed_by"?: string | null,"status"?: string,"title": string,"type": string
                  }
                  Update: {
                    "category"?: string,"created_at"?: string,"description"?: string,"happened_on"?: string,"id"?: string,"location"?: string,"owner_id"?: string,"ref"?: never,"reject_reason"?: string | null,"resolved_at"?: string | null,"reviewed_by"?: string | null,"status"?: string,"title"?: string,"type"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "posts_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "posts_reviewed_by_fkey"
      columns: ["reviewed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"full_name": string,"id": string,"role": string,"status": string,"student_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"full_name": string,"id": string,"role"?: string,"status"?: string,"student_id": string
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string,"id"?: string,"role"?: string,"status"?: string,"student_id"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "admin_counts":
{ Args: Record<PropertyKey, never>; Returns: {
              "pending_claims": number,"pending_posts": number,"pending_users": number
            }[]
                           },
"admin_decide_claim":
{ Args: { "p_claim_id": string,"p_decision": string,"p_note"?: string }; Returns: undefined
                           },
"admin_list_claims":
{ Args: { "p_status"?: string }; Returns: {
              "claimant_name": string,"claimant_student_id": string,"created_at": string,"id": string,"is_conflict": boolean,"message": string,"post_description": string,"post_id": string,"post_ref": number,"post_title": string,"post_type": string,"status": string
            }[]
                           },
"admin_list_log":
{ Args: Record<PropertyKey, never>; Returns: {
              "action": string,"admin_name": string,"created_at": string,"id": number,"note": string,"target_id": string,"target_type": string
            }[]
                           },
"admin_list_posts":
{ Args: { "p_status"?: string }; Returns: {
              "category": string,"created_at": string,"description": string,"happened_on": string,"id": string,"is_mine": boolean,"location": string,"owner_name": string,"ref": number,"reject_reason": string,"status": string,"title": string,"type": string
            }[]
                           },
"admin_list_users":
{ Args: { "p_status"?: string }; Returns: {
              "created_at": string,"email": string,"full_name": string,"id": string,"status": string,"student_id": string
            }[]
                           },
"admin_review_post":
{ Args: { "p_decision": string,"p_post_id": string,"p_reason"?: string }; Returns: undefined
                           },
"admin_review_user":
{ Args: { "p_decision": string,"p_user_id": string }; Returns: undefined
                           },
"close_post":
{ Args: { "p_post_id": string }; Returns: undefined
                           },
"create_claim":
{ Args: { "p_message": string,"p_post_id": string }; Returns: string
                           },
"create_post":
{ Args: { "p_category": string,"p_description": string,"p_happened_on": string,"p_location": string,"p_title": string,"p_type": string }; Returns: string
                           },
"get_post":
{ Args: { "p_post_id": string }; Returns: {
              "category": string,"created_at": string,"description": string,"happened_on": string,"id": string,"is_mine": boolean,"location": string,"ref": number,"reject_reason": string,"resolved_at": string,"status": string,"title": string,"type": string
            }[]
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"my_claim_status":
{ Args: { "p_post_id": string }; Returns: string
                           },
"my_claims":
{ Args: Record<PropertyKey, never>; Returns: {
              "created_at": string,"decided_at": string,"id": string,"message": string,"post_id": string,"post_ref": number,"post_title": string,"post_type": string,"status": string
            }[]
                           },
"my_posts":
{ Args: Record<PropertyKey, never>; Returns: {
              "category": string,"created_at": string,"happened_on": string,"id": string,"location": string,"ref": number,"reject_reason": string,"resolved_at": string,"status": string,"title": string,"type": string
            }[]
                           },
"require_admin":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"require_approved":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"search_posts":
{ Args: { "p_category"?: string,"p_query"?: string,"p_type"?: string }; Returns: {
              "category": string,"created_at": string,"description": string,"happened_on": string,"id": string,"location": string,"ref": number,"status": string,"title": string,"type": string
            }[]
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const
