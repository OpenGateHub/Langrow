import { auth, currentUser } from '@clerk/nextjs/server'
import { SUPABASE_TABLES } from '@/app/config';
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis'; // Necesitarás instalar 'googleapis'
import { supabaseClient } from '@/app/api/supabaseClient';
import { getProfileByUserId } from '@/app/api/profile/profile';

// Asegúrate de que estas variables de entorno estén configuradas en tu .env.local
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.PRIVATE_GOOGLE_SECRET_ID;
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI; // Debe coincidir con el URI autorizado en Google Cloud

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const { userId } = await auth();

  if (!code || !userId) {
    return NextResponse.json({ message: 'Faltan el código de autorización o el ID de usuario.' }, { status: 500 });
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    console.error('Faltan variables de entorno para Google OAuth.');
    return NextResponse.json({ message: 'Error de configuración del servidor.' }, { status: 500 });
  }

  const profile = await getProfileByUserId(userId);
  if (!profile) {
    console.error(`No se encontró el perfil para el userId: ${userId}`);
    return NextResponse.json({ message: 'Perfil de usuario no encontrado.' }, { status: 404 });
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
        // Podrías buscar si ya existe un refresh token para este userId en tu DB.
        console.warn(`No se recibió un refresh token para el userId: ${userId}. Posiblemente ya existía una autorización previa.`);
    }

    const { access_token, refresh_token, expiry_date, scope } = tokens;
    const { data, error } = await supabaseClient
        .from(SUPABASE_TABLES.PROFILES_SECRETS)
        .upsert({
            userId: profile.id,
            token: access_token,
            refresh_token: refresh_token || undefined, // Guarda el refresh token si existe,
            expires_at: new Date(Date.now() + (expiry_date! - Date.now())).toISOString(), // Convert Date to ISO string
            provider: 'GOOGLE_CALENDAR',
            scope,
        }
    );
    
    if (error) {
        throw error;
    }

    const { data: updatedProfile, error: profileError } = await supabaseClient
        .from(SUPABASE_TABLES.PROFILES)
        .update({ isZoomEnabled: true })
        .eq('id', profile.id)
        .select()
        .single();
    if (profileError) {
        console.error(`Error al actualizar el perfil del usuario: ${profileError.message}`);
        return NextResponse.json({ message: `Error al actualizar el perfil del usuario: ${profileError.message}` }, { status: 500 });
    }
    return NextResponse.redirect(new URL('/home', req.url));
  } catch (error: any) {
    console.error('Error al intercambiar el código por tokens de Google:', error.message);
    // Google puede devolver errores específicos como 'invalid_grant' si el código ya fue usado
    return NextResponse.json({ message: `Error al procesar la autenticación de Google: ${error.message}` }, { status: 500 });
  }
}