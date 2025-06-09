import { SUPABASE_TABLES } from "@/app/config";
import { supabaseClient } from "@/app/api/supabaseClient";
import { UserIntegrationData } from "@/interfaces/UserIntegration";

/**
 * **Funciones de interacción con Supabase (Integración del ORM)**
 * Estas funciones se mueven aquí o se importan desde un archivo dedicado si ya las tienes.
 */
export async function getUserIntegration(
  userId: number
): Promise<UserIntegrationData | null> {
  const { data, error } = await supabaseClient
    .from(SUPABASE_TABLES.PROFILES_SECRETS)
    .select("id, userId, provider, token, refresh_token, expires_at, scope") // Seleccionar campos específicos
    .eq("userId", userId)
    .eq("provider", "GOOGLE_CALENDAR")
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 es 'no rows found'
    console.error(
      `Error al obtener la integración de Google Calendar para el usuario ${userId}:`,
      error.message
    );
    throw new Error(
      `No se pudo obtener la integración de Google Calendar: ${error.message}`
    );
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
      `Error al guardar/actualizar la integración de Google Calendar para el usuario ${userId}:`,
      error.message
    );
    throw new Error(
      `Error al guardar la integración en Supabase: ${error.message}`
    );
  }
}
