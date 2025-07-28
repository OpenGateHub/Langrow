export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      Achievements: {
        Row: {
          benefit: number | null
          code: string | null
          condition: string | null
          createdAt: string
          description: string | null
          iconImg: string | null
          id: number
          isActive: boolean | null
          staffOnly: boolean | null
          title: string | null
        }
        Insert: {
          benefit?: number | null
          code?: string | null
          condition?: string | null
          createdAt?: string
          description?: string | null
          iconImg?: string | null
          id?: number
          isActive?: boolean | null
          staffOnly?: boolean | null
          title?: string | null
        }
        Update: {
          benefit?: number | null
          code?: string | null
          condition?: string | null
          createdAt?: string
          description?: string | null
          iconImg?: string | null
          id?: number
          isActive?: boolean | null
          staffOnly?: boolean | null
          title?: string | null
        }
        Relationships: []
      }
      bank_logs: {
        Row: {
          action: string
          bank_code: string
          created_at: string | null
          id: string
          metadata: Json | null
          performed_by: string
          profile_id: number
        }
        Insert: {
          action: string
          bank_code: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          performed_by: string
          profile_id: number
        }
        Update: {
          action?: string
          bank_code?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string
          profile_id?: number
        }
        Relationships: []
      }
      ConfigurationBanks: {
        Row: {
          created_at: string
          id: number
          isActive: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          isActive?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          isActive?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      Mentorship: {
        Row: {
          beginsAt: string | null
          category: number | null
          classRoomUrl: string | null
          confirmed: boolean | null
          createdAt: string
          duration: number | null
          endsAt: string | null
          id: number
          meetingExternalId: string | null
          paymentId: string | null
          professorRate: number | null
          professorReview: string | null
          requestDescription: string | null
          reviewDate: string | null
          status: string | null
          studentId: number | null
          title: string | null
          updatedAt: string | null
          userId: number | null
        }
        Insert: {
          beginsAt?: string | null
          category?: number | null
          classRoomUrl?: string | null
          confirmed?: boolean | null
          createdAt?: string
          duration?: number | null
          endsAt?: string | null
          id?: number
          meetingExternalId?: string | null
          paymentId?: string | null
          professorRate?: number | null
          professorReview?: string | null
          requestDescription?: string | null
          reviewDate?: string | null
          status?: string | null
          studentId?: number | null
          title?: string | null
          updatedAt?: string | null
          userId?: number | null
        }
        Update: {
          beginsAt?: string | null
          category?: number | null
          classRoomUrl?: string | null
          confirmed?: boolean | null
          createdAt?: string
          duration?: number | null
          endsAt?: string | null
          id?: number
          meetingExternalId?: string | null
          paymentId?: string | null
          professorRate?: number | null
          professorReview?: string | null
          requestDescription?: string | null
          reviewDate?: string | null
          status?: string | null
          studentId?: number | null
          title?: string | null
          updatedAt?: string | null
          userId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Mentorship_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "MentorshipCategory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Mentorship_studentId_fkey"
            columns: ["studentId"]
            isOneToOne: false
            referencedRelation: "StudentProfile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Mentorship_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "UserProfile"
            referencedColumns: ["id"]
          },
        ]
      }
      MentorshipCategory: {
        Row: {
          code: string | null
          created_at: string
          id: number
          isActive: boolean | null
          name: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: number
          isActive?: boolean | null
          name?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: number
          isActive?: boolean | null
          name?: string | null
        }
        Relationships: []
      }
      MentorshipUserScheduleConfiguration: {
        Row: {
          category: number | null
          configuration: Json | null
          created_at: string
          id: number
          isActive: boolean | null
          updated_at: string | null
          userId: number | null
        }
        Insert: {
          category?: number | null
          configuration?: Json | null
          created_at?: string
          id?: number
          isActive?: boolean | null
          updated_at?: string | null
          userId?: number | null
        }
        Update: {
          category?: number | null
          configuration?: Json | null
          created_at?: string
          id?: number
          isActive?: boolean | null
          updated_at?: string | null
          userId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "MentorshipUserScheduleConfiguration_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "UserProfile"
            referencedColumns: ["id"]
          },
        ]
      }
      Notifications: {
        Row: {
          createdAt: string
          id: number
          isActive: boolean | null
          isStaff: boolean | null
          message: string | null
          profileId: number | null
          updatedAt: string | null
          url: string | null
        }
        Insert: {
          createdAt?: string
          id?: number
          isActive?: boolean | null
          isStaff?: boolean | null
          message?: string | null
          profileId?: number | null
          updatedAt?: string | null
          url?: string | null
        }
        Update: {
          createdAt?: string
          id?: number
          isActive?: boolean | null
          isStaff?: boolean | null
          message?: string | null
          profileId?: number | null
          updatedAt?: string | null
          url?: string | null
        }
        Relationships: []
      }
      Payments: {
        Row: {
          created_at: string
          external_ref: string | null
          id: number
          payment_details: Json | null
          payment_id: string | null
          payment_type: string | null
          preference_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          external_ref?: string | null
          id?: number
          payment_details?: Json | null
          payment_id?: string | null
          payment_type?: string | null
          preference_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          external_ref?: string | null
          id?: number
          payment_details?: Json | null
          payment_id?: string | null
          payment_type?: string | null
          preference_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      StudentProfile: {
        Row: {
          createdAt: string
          id: number
          isActive: boolean | null
          updatedAt: string | null
          userId: string | null
        }
        Insert: {
          createdAt?: string
          id?: number
          isActive?: boolean | null
          updatedAt?: string | null
          userId?: string | null
        }
        Update: {
          createdAt?: string
          id?: number
          isActive?: boolean | null
          updatedAt?: string | null
          userId?: string | null
        }
        Relationships: []
      }
      UserAchievements: {
        Row: {
          achivementId: number | null
          createdAt: string
          createdBy: string | null
          id: number
          isActive: boolean | null
          profileId: number | null
        }
        Insert: {
          achivementId?: number | null
          createdAt?: string
          createdBy?: string | null
          id?: number
          isActive?: boolean | null
          profileId?: number | null
        }
        Update: {
          achivementId?: number | null
          createdAt?: string
          createdBy?: string | null
          id?: number
          isActive?: boolean | null
          profileId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achivementId_fkey"
            columns: ["achivementId"]
            isOneToOne: false
            referencedRelation: "Achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "UserProfile"
            referencedColumns: ["id"]
          },
        ]
      }
      UserProfile: {
        Row: {
          createdAt: string
          description: string | null
          email: string | null
          id: number
          isActive: boolean | null
          isStaff: boolean | null
          isZoomEnabled: boolean | null
          location: string | null
          name: string | null
          price: number | null
          profileImg: string | null
          rating: string | null
          reviews: number | null
          role: number | null
          title: string | null
          updatedAt: string | null
          userId: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          email?: string | null
          id?: number
          isActive?: boolean | null
          isStaff?: boolean | null
          isZoomEnabled?: boolean | null
          location?: string | null
          name?: string | null
          price?: number | null
          profileImg?: string | null
          rating?: string | null
          reviews?: number | null
          role?: number | null
          title?: string | null
          updatedAt?: string | null
          userId: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          email?: string | null
          id?: number
          isActive?: boolean | null
          isStaff?: boolean | null
          isZoomEnabled?: boolean | null
          location?: string | null
          name?: string | null
          price?: number | null
          profileImg?: string | null
          rating?: string | null
          reviews?: number | null
          role?: number | null
          title?: string | null
          updatedAt?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserProfile_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "UserProfileRole"
            referencedColumns: ["id"]
          },
        ]
      }
      UserProfileBankAccounts: {
        Row: {
          account_number: string | null
          account_type: string | null
          alias: string | null
          bank_id: number | null
          bank_name: string | null
          code: string | null
          created_at: string
          dni_number: string | null
          dni_type: string | null
          id: number
          isActive: boolean | null
          isPrimary: boolean | null
          profile_id: number | null
          tokenized: string | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          alias?: string | null
          bank_id?: number | null
          bank_name?: string | null
          code?: string | null
          created_at?: string
          dni_number?: string | null
          dni_type?: string | null
          id?: number
          isActive?: boolean | null
          isPrimary?: boolean | null
          profile_id?: number | null
          tokenized?: string | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          alias?: string | null
          bank_id?: number | null
          bank_name?: string | null
          code?: string | null
          created_at?: string
          dni_number?: string | null
          dni_type?: string | null
          id?: number
          isActive?: boolean | null
          isPrimary?: boolean | null
          profile_id?: number | null
          tokenized?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "UserProfileBankAccounts_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "ConfigurationBanks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UserProfileBankAccounts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "UserProfile"
            referencedColumns: ["id"]
          },
        ]
      }
      UserProfileRole: {
        Row: {
          code: string | null
          created_at: string
          id: number
          isActive: boolean | null
          roleName: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: number
          isActive?: boolean | null
          roleName?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: number
          isActive?: boolean | null
          roleName?: string | null
        }
        Relationships: []
      }
      UserProfileSecrets: {
        Row: {
          created_at: string
          expires_at: string | null
          id: number
          provider: string | null
          refresh_token: string | null
          scope: string | null
          token: string | null
          userId: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: number
          provider?: string | null
          refresh_token?: string | null
          scope?: string | null
          token?: string | null
          userId?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: number
          provider?: string | null
          refresh_token?: string | null
          scope?: string | null
          token?: string | null
          userId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "UserProfileSecrets_userId_fkey"
            columns: ["userId"]
            isOneToOne: true
            referencedRelation: "UserProfile"
            referencedColumns: ["id"]
          },
        ]
      }
      UserReviews: {
        Row: {
          createdAt: string
          id: number
          isActive: boolean | null
          notes: string | null
          qualification: number
          studentId: number
          updatedAt: string | null
          userId: number
        }
        Insert: {
          createdAt?: string
          id?: number
          isActive?: boolean | null
          notes?: string | null
          qualification?: number
          studentId: number
          updatedAt?: string | null
          userId: number
        }
        Update: {
          createdAt?: string
          id?: number
          isActive?: boolean | null
          notes?: string | null
          qualification?: number
          studentId?: number
          updatedAt?: string | null
          userId?: number
        }
        Relationships: [
          {
            foreignKeyName: "UserReviews_studentId_fkey"
            columns: ["studentId"]
            isOneToOne: false
            referencedRelation: "StudentProfile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UserReviews_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "UserProfile"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mentorships_with_names: {
        Row: {
          beginsAt: string | null
          category: string | null
          classRoomUrl: string | null
          confirmed: boolean | null
          createdAt: string | null
          duration: number | null
          endsAt: string | null
          id: number | null
          meetingExternalId: string | null
          paymentId: string | null
          professorName: string | null
          professorRate: number | null
          professorReview: string | null
          requestDescription: string | null
          reviewDate: string | null
          status: string | null
          studentId: number | null
          studentName: string | null
          title: string | null
          updatedAt: string | null
          userId: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Mentorship_studentId_fkey"
            columns: ["studentId"]
            isOneToOne: false
            referencedRelation: "StudentProfile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Mentorship_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "UserProfile"
            referencedColumns: ["id"]
          },
        ]
      }
      UserPaymentsView: {
        Row: {
          created_at: string | null
          external_ref: string | null
          id: number | null
          payee: number | null
          payment_details: Json | null
          payment_id: string | null
          payment_type: string | null
          preference_id: string | null
          receipt: number | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Mentorship_studentId_fkey"
            columns: ["payee"]
            isOneToOne: false
            referencedRelation: "StudentProfile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Mentorship_userId_fkey"
            columns: ["receipt"]
            isOneToOne: false
            referencedRelation: "UserProfile"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_professor_reviews: {
        Args: { pid: number }
        Returns: {
          review_id: number
          review_date: string
          professor_id: number
          reviewer_id: number
          is_active: boolean
          qualification: number
          notes: string
          reviewer_userid: string
          reviewer_user_profile_id: number
          reviewer_name: string
          reviewer_email: string
          reviewer_profile_img: string
        }[]
      }
      get_user_profile_by_student_id: {
        Args: { student_id: number }
        Returns: {
          id: number
          createat: string
          name: string
          title: string
          description: string
          location: string
          updatedat: string
          userid: string
          isactive: boolean
          isstaff: boolean
          rating: string
          profileimg: string
          reviews: number
          price: number
          email: string
          role: number
          student_code: number
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
