import { SUPABASE_TABLES } from "@/app/config";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis"; // Necesitarás instalar 'googleapis'
import { supabaseClient } from "@/app/api/supabaseClient";
import jwt from "jsonwebtoken";
import { getProfileByUserId } from "@/app/api/profile/profile";

// Asegúrate de que estas variables de entorno estén configuradas en tu .env.local
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.PRIVATE_GOOGLE_SECRET_ID;
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI; // Debe coincidir con el URI autorizado en Google Cloud

const PROVIDER = "GOOLER_CALENDAR";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // Este es el token JWT que contiene el userId
  const payload = state
    ? jwt.verify(state, process.env.OAUTH_STATE_SECRET || "")
    : null;
  const userId = payload?.userId; // Extraemos el userId del payload del JWT

  console.log("Código de autorización recibido:", userId);

  if (!code || !userId) {
    return NextResponse.json(
      { message: "Faltan el código de autorización o el ID de usuario." },
      { status: 500 }
    );
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    console.error("Faltan variables de entorno para Google OAuth.");
    return NextResponse.json(
      { message: "Error de configuración del servidor." },
      { status: 500 }
    );
  }

  const profile = await getProfileByUserId(userId);
  if (!profile) {
    console.error(`No se encontró el perfil para el userId: ${userId}`);
    return NextResponse.json(
      { message: "Perfil de usuario no encontrado." },
      { status: 404 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  try {
    // Intercambia el código de autorización por tokens de acceso y refresh
    const { tokens } = await oauth2Client.getToken(code);

    // Los tokens.access_token es el token de acceso
    // Los tokens.refresh_token es el refresh token (solo se recibe la primera vez)

    if (!tokens.refresh_token) {
      // IMPORTANTE: Un refresh_token solo se devuelve la primera vez que el usuario autoriza
      // Si el usuario ya había autorizado tu app antes y no le pediste prompt='consent',
      // o si ya tienes un refresh token almacenado, no se enviará uno nuevo.
      // Maneja este caso si esperas un refresh_token y no lo recibes.
      console.warn(
        `No se recibió un refresh token para el userId: ${userId}. Posiblemente ya existía una autorización previa.`
      );
    }

    const { access_token, refresh_token, expiry_date, scope } = tokens;

    // Guardar la integración usando la estructura correcta para Google Calendar
    const { data: secretsData, error: queryError } = await supabaseClient
      .from(SUPABASE_TABLES.PROFILES_SECRETS)
      .select()
      .eq("userId", profile.id)
      .eq("provider", PROVIDER);
    if (secretsData != null && secretsData?.length > 0) {
      const { data, error } = await supabaseClient
        .from(SUPABASE_TABLES.PROFILES_SECRETS)
        .update({
          userId: profile.id,
          token: access_token,
          refresh_token: refresh_token || undefined, // Guarda el refresh token si existe,
          expires_at: expiry_date ? new Date(expiry_date).toISOString() : null, // Convert to ISO string
          provider: PROVIDER,
          scope,
        }).eq('userId', profile.id);
    } else {
      const { data, error } = await supabaseClient
        .from(SUPABASE_TABLES.PROFILES_SECRETS)
        .insert({
          userId: profile.id,
          token: access_token,
          refresh_token: refresh_token || undefined, // Guarda el refresh token si existe,
          expires_at: expiry_date ? new Date(expiry_date).toISOString() : null, // Convert to ISO string
          provider: PROVIDER,
          scope,
        });
    }

    // Actualizar el perfil para indicar que Google Calendar está habilitado
    const { data: updatedProfile, error: profileError } = await supabaseClient
      .from(SUPABASE_TABLES.PROFILES)
      .update({ isZoomEnabled: true }) // Mantenemos este campo por compatibilidad, pero representa "integración de reuniones habilitada"
      .eq("id", profile.id)
      .select()
      .single();

    if (profileError) {
      console.error(
        `Error al actualizar el perfil del usuario: ${profileError.message}`
      );
      return NextResponse.json(
        {
          message: `Error al actualizar el perfil del usuario: ${profileError.message}`,
        },
        { status: 500 }
      );
    }
    
    console.log('Integración con Google Calendar completada exitosamente para userId:', userId);
    // Redirigir a la raíz que funciona correctamente
    return NextResponse.redirect(new URL('/', req.url));

  } catch (error: any) {
    console.error(
      "Error al intercambiar el código por tokens de Google:",
      error.message
    );
    // Google puede devolver errores específicos como 'invalid_grant' si el código ya fue usado
    return NextResponse.json(
      {
        message: `Error al procesar la autenticación de Google: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
