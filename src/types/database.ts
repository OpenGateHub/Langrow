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
          createdAt: string
          description: string | null
          iconImg: string | null
          id: number
          isActive: boolean | null
          staffOnly: boolean | null
          title: string | null
        }
        Insert: {
          createdAt?: string
          description?: string | null
          iconImg?: string | null
          id?: number
          isActive?: boolean | null
          staffOnly?: boolean | null
          title?: string | null
        }
        Update: {
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
          confirmed: boolean | null
          createdAt: string
          duration: number | null
          endsAt: string | null
          id: number
          professorRate: number | null
          professorReview: string | null
          reviewDate: string | null
          studentId: number | null
          updatedAt: Date | null
          userId: number | null
        }
        Insert: {
          beginsAt?: string | null
          confirmed?: boolean | null
          createdAt?: string
          duration?: number | null
          endsAt?: string | null
          id?: number
          professorRate?: number | null
          professorReview?: string | null
          reviewDate?: string | null
          studentId?: number | null
          updatedAt?: Date | null
          userId?: number | null
        }
        Update: {
          beginsAt?: string | null
          confirmed?: boolean | null
          createdAt?: string
          duration?: number | null
          endsAt?: string | null
          id?: number
          professorRate?: number | null
          professorReview?: string | null
          reviewDate?: string | null
          studentId?: number | null
          updatedAt?: Date | null
          userId?: number | null
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
      Notifications: {
        Row: {
          createdAt: string
          id: number
          isActive: boolean | null
          isStaff: boolean | null
          message: string | null
          profileId: number | null
          updatedAt: Date | null
          url: string | null
        }
        Insert: {
          createdAt?: string
          id?: number
          isActive?: boolean | null
          isStaff?: boolean | null
          message?: string | null
          profileId?: number | null
          updatedAt?: Date | null
          url?: string | null
        }
        Update: {
          createdAt?: string
          id?: number
          isActive?: boolean | null
          isStaff?: boolean | null
          message?: string | null
          profileId?: number | null
          updatedAt?: Date | null
          url?: string | null
        }
        Relationships: []
      }
      StudentProfile: {
        Row: {
          createdAt: string
          id: number
          isActive: boolean | null
          updatedAt: Date | null
          userId: string | null
        }
        Insert: {
          createdAt?: string
          id?: number
          isActive?: boolean | null
          updatedAt?: Date | null
          userId?: string | null
        }
        Update: {
          createdAt?: string
          id?: number
          isActive?: boolean | null
          updatedAt?: Date | null
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
          location: string | null
          name: string | null
          price: number | null
          profileImg: string | null
          rating: string | null
          reviews: number | null
          role: number | null
          title: string | null
          updatedAt: Date | null
          userId: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          email?: string | null
          id?: number
          isActive?: boolean | null
          isStaff?: boolean | null
          location?: string | null
          name?: string | null
          price?: number | null
          profileImg?: string | null
          rating?: string | null
          reviews?: number | null
          role?: number | null
          title?: string | null
          updatedAt?: Date | null
          userId: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          email?: string | null
          id?: number
          isActive?: boolean | null
          isStaff?: boolean | null
          location?: string | null
          name?: string | null
          price?: number | null
          profileImg?: string | null
          rating?: string | null
          reviews?: number | null
          role?: number | null
          title?: string | null
          updatedAt?: Date | null
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
      UserReviews: {
        Row: {
          createdAt: string
          id: number
          isActive: boolean | null
          notes: string | null
          qualification: number
          studentId: number
          updatedAt: Date | null
          userId: number
        }
        Insert: {
          createdAt?: string
          id?: number
          isActive?: boolean | null
          notes?: string | null
          qualification?: number
          studentId: number
          updatedAt?: Date | null
          userId: number
        }
        Update: {
          createdAt?: string
          id?: number
          isActive?: boolean | null
          notes?: string | null
          qualification?: number
          studentId?: number
          updatedAt?: Date | null
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
      [_ in never]: never
    }
    Functions: {
      get_professor_reviews: {
        Args: {
          pid: number
        }
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
        Args: {
          student_id: number
        }
        Returns: {
          id: number
          createat: string
          name: string
          title: string
          description: string
          location: string
          updatedat: Date
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
