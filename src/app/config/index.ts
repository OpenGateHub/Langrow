export enum PROFILE_ROLE_STRING {
    PROFESOR = "org:profesor",
    ALUMNO = "org:alumno",
    ADMIN = "org:admin"
}

export enum PROFILE_ROLE {
    "org:profesor" = 1,
    "org:alumno" = 2,
    "org:admin" = 3
}

export const ROLE_MAP: Record<PROFILE_ROLE_STRING, PROFILE_ROLE> = {
    [PROFILE_ROLE_STRING.PROFESOR]: PROFILE_ROLE["org:profesor"],
    [PROFILE_ROLE_STRING.ALUMNO]: PROFILE_ROLE["org:alumno"],
    [PROFILE_ROLE_STRING.ADMIN]: PROFILE_ROLE["org:admin"],
};

export enum SUPABASE_TABLES {
    ACHIEVEMENT = "Achievements",
    MENTORSHIP = "Mentorship",
    MENTORSHIP_VIEW = "mentorships_with_names",
    PROFESSOR_REVIEWS = "UserReviews",
    PROFILES = "UserProfile",
    PROFILES_SECRETS = "UserProfileSecrets",
    STUDENT_PROFILES = "StudentProfile"
}

export enum SUPABASE_FUNCTIONS {
    GET_STUDENT_PROFILE_ID = "get_user_profile_by_student_id",
    PROFESSOR_REVIEWS = "get_professor_reviews",
}
