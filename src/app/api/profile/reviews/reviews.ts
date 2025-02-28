import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_FUNCTIONS } from "@/app/config";
import { SupabaseUserReviews } from "@/types/supabase";

export const getProfessorReviews = async (professorId: number) : Promise<SupabaseUserReviews> => {
    try {
        const { data, error } = await supabaseClient
            .rpc(SUPABASE_FUNCTIONS.PROFESSOR_REVIEWS, { pid: professorId });

        if (error) {
            throw error;
        }
        return data;

    } catch (err) {
        console.error(err.message);
        throw new Error("Unexpected error: Professor reviews not found.");
    }
}