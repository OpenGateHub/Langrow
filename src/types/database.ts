export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          category: number | null
          confirmed: boolean | null
          createdAt: string | null
          duration: number | null
          endsAt: string | null
          id: number | null
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
          url: string | null
          userId: number | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
