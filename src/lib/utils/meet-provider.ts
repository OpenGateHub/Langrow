import { SUPABASE_TABLES } from "@/app/config";
import { supabaseClient } from "@/app/api/supabaseClient";
import { UserIntegrationData } from "@/interfaces/UserIntegration";

/**
 * Funcion para obtener la integración de un usuario desde Supabase. 
 * Permite recuperar los datos de integración de un usuario específico,
 * incluyendo el token de acceso, el token de actualización, la fecha de expiración y el alcance.
 * @param userId - ID del usuario para el cual se desea obtener la integración.
 */
export async function getUserIntegration(
  userId: number
): Promise<UserIntegrationData | null> {
  const { data, error } = await supabaseClient
    .from(SUPABASE_TABLES.PROFILES_SECRETS)
    .select("id, userId, provider, token, refresh_token, expires_at, scope") // Seleccionar campos específicos
    .eq("userId", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 es 'no rows found'
    console.error(
      `Error al obtener la integración para el usuario ${userId}:`,
      error.message
    );
    throw new Error(`No se pudo obtener la integración  ${error.message}`);
  }

  if (!data) {
    // console.warn(`No se encontraron datos de integración para el usuario ${userId}.`);
    return null;
  }

  return {
    id: data.id,
    userId: data.userId,
    provider: data.provider,
    accessToken: data.token, // Mapea 'token' de Supabase a 'accessToken'
    refreshToken: data.refresh_token || null,
    expiresAt: data.expires_at ? new Date(data.expires_at) : null,
    scope: data.scope || undefined,
  } as UserIntegrationData;
}

// TODO:: la función saveUserIntegration debe ser capaz de actualizar los datos de integración de un usuario específico en Supabase,
// incluyendo el token de acceso, el token de actualización, la fecha de expiración y el alcance.
// si hay un conflicto, debe actualizar el registro existente en lugar de crear uno nuevo.
export async function saveUserIntegration(
  userId: number,
  data: Partial<UserIntegrationData>
): Promise<void> {
  const { error } = await supabaseClient
    .from(SUPABASE_TABLES.PROFILES_SECRETS)
    .upsert(
      {
        userId: userId,
        token: data.accessToken,
        refresh_token: data.refreshToken || null,
        expires_at: data.expiresAt?.toISOString() || null,
        provider: data.provider,
        scope: data.scope || undefined,
      },
      {
        onConflict: "userId,provider", // La clave única para el upsert
        ignoreDuplicates: false,
      }
    );

  if (error) {
    console.error(
      `Error al guardar/actualizar la integración ${data.provider} para el usuario ${userId}:`,
      error.message
    );
    throw new Error(
      `Error al guardar la integración en Supabase: ${error.message}`
    );
  }
}
