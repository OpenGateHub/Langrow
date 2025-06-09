import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_FUNCTIONS, SUPABASE_TABLES } from "@/app/config";

/**
 * Funcion para buscar el perfil del estudiante usando su ID
 * Esta funcion utiliza una funcion de supabase para obtener el perfil del estudiante
 * @param studentId 
 * @returns 
 */
export const getStudentProfileById = async (studentId: number) => {
    try {
        const { data, error } = await supabaseClient
            .rpc(SUPABASE_FUNCTIONS.GET_STUDENT_PROFILE_ID, { student_id: studentId })
        if (error) {
            console.error(`Error al obtener el perfil del estudiante: ${error.message}`);
            return null;
        }
        return data[0];
    } catch (e) {
        console.error(e);
        throw new Error("Error buscando el perfil del estudiante en la base de datos");
    }
};

export const getStudentProfileByUserId = async (userId: string) => {
    try {
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.STUDENT_PROFILES)
            .select()
            .eq("userId", userId);
        if (error) {
            console.error(`Error al obtener el perfil del estudiante: ${error.message}`);
            return null;
        }
        return data[0];
    } catch (e) {
        console.error(e);
        throw new Error("Error buscando el perfil del estudiante en la base de datos");
    }
}

/**
 * Funcion para buscar el perfil de usuario usando el id de usuario
 * @param profileUserId 
 * @returns 
 */
export const getProfileByUserId = async (profileUserId: string) => {
    try {
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.PROFILES)
            .select()
            .eq("userId", profileUserId);
        if (error) {
            console.error(`Error al obtener el perfil del profesor: ${error.message}`);
            return null;
        }
        return data[0];
    } catch (e) {
        console.error(e);
        throw new Error("Error buscando el perfil del profesor en la base de datos");
    }
}

/**
 * Funcion generica para obtener el email de un usuario a partir de su id de perfil
 * @param profileUserId 
 * @returns 
 */
export const getEmailbyUserProfileId = async (profileUserId: number) => {
    try {
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.PROFILES)
            .select("email")
            .eq("id", profileUserId);
        if (error) {
            console.error(`Error al obtener el email del usuario: ${error.message}`);
            return null;
        }
        return data[0]?.email || null;
    } catch (e) {
        console.error(e);
        throw new Error("Error buscando el email del usuario en la base de datos");
    }
};
