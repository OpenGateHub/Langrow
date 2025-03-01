import { supabaseClient } from "@/app/api/supabaseClient";
import {SUPABASE_FUNCTIONS, SUPABASE_TABLES} from "@/app/config";
import {SupabaseStudentReviews, SupabaseUserReviews} from "@/types/supabase";

export const getProfessorReviewsById = async (professorId: number) : Promise<SupabaseUserReviews> => {
    const { data, error } = await supabaseClient
        .rpc(SUPABASE_FUNCTIONS.PROFESSOR_REVIEWS, { pid: professorId });
    if (error) {
        throw error;
    }
    return data;
}

export const getStudentReviewsById = async (studentProfileId: number): Promise<SupabaseStudentReviews | null> => {
    try {
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.MENTORSHIP)
            .select(`
                id,
                userId,
                studentId,
                professorRate,
                professorReview,
                reviewDate,
                UserProfile(
                    id,
                    name,
                    title,
                    profileImg
                )
            `).eq('studentId', studentProfileId).limit(10);
        if (error) {
            console.error('Supabase error:', error);
            return null;
        }
        return data;
    } catch (e) {
        console.error('Unexpected error:', e);
        return null;
    }
}