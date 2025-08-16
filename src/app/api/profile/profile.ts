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

/**
 * Busca profesores por nombre o email
 * @param value - Nombre o email del profesor a buscar
 * 
*/
export const getProfessorProfilebyString = async (value: string) => {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLES.PROFILES)
      .select(
        `
          id,
          userId,
          name,
          description,
          reviews,
          price,
          rating,
          location,
          isActive,
          createdAt,
          updatedAt,
          profileImg,
          email
        `
      )
      .eq("role", 1) // 1 = org:profesor
      .eq("isActive", true)
      .or(`name.ilike.%${value}%,email.ilike.%${value}%`);

    if (error) {
      throw new Error(
        `Error al obtener el perfil del profesor: ${error.message}`
      );
    }
    return data ?? [];
  } catch (e) {
    console.error(e);
    throw new Error(
      "Error buscando el perfil del profesor en la base de datos"
    );
  }
};

/**
 * Obtiene los perfiles de profesores paginados
 * @param page - Número de página (default: 1)
 * @param limit - Número de resultados por página (default: 10)
 * @returns Un objeto con los datos de los perfiles y el total de perfiles
 */
export const getProfessorProfiles = async (
  page: number = 1,
  limit: number = 10
) => {
  try {
    const offset = (page - 1) * limit;
    const { data, error, count } = await supabaseClient
      .from(SUPABASE_TABLES.PROFILES)
      .select(
        `
          id,
          userId,
          name,
          description,
          reviews,
          price,
          rating,
          location,
          isActive,
          createdAt,
          updatedAt,
          profileImg,
          email
        `,
        { count: "exact" }
      )
      .eq("role", 1) // 1 = org:profesor
      .eq("isActive", true)
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(
        `Error al obtener los perfiles de profesores: ${error.message}`
      );
    }
    return { data: data ?? [], total: count ?? 0 };
  } catch (e) {
    console.error(e);
    throw new Error(
      "Error buscando los perfiles de profesores en la base de datos"
    );
  }
};
