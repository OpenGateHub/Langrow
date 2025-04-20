
export interface SupabaseStudentProfile {
    id: number;
    userId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface SupabaseUserProfile {
    id: number;
    createdAt: Date;
    name: string;
    title: string;
    description: string;
    location: string;
    updatedAt: Date;
    userId: string;
    isActive: boolean;
    isStaff: boolean;
    rating: string;
    profileImg: string;
    reviews: number;
    price: number;
    role: number;
    email: string;
}

export interface SupabaseUserProfileRole {
    id: number;
    roleName: string;
    isActive: boolean;
    created_at: Date;
    code: string;
}


export interface SupabaseUserReview {
    review_id: number;
    review_date: string;
    professor_id: number;
    reviewer_id: number;
    qualification: number;
    notes: string;
    reviewer_user_profile_id: number;
    reviewer_userid: string;
    reviewer_name: string;
    reviewer_email: string;
    reviewer_profile_img: string;
    is_active: boolean;
}

export type SupabaseUserReviews = SupabaseUserReview[];

export interface SupabaseStudentReview {
    id: number;
    userId: number;
    studentId: number;
    professorRate: number;
    professorReview: string;
    reviewDate: string;
    UserProfile: SupabaseUserProfile;
}

export type SupabaseStudentReviews = SupabaseStudentReview[];


export interface SupabasePayment {
    id?: number
    payment_id: string;
    payment_details: any;
    external_reference: string;
    created_at?: Date;
}
