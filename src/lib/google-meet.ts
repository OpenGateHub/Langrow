// lib/google-meet.ts
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { supabaseClient } from '@/app/api/supabaseClient';
import { SUPABASE_TABLES } from '@/app/config';

// --- Tipos para la Integración de Usuario ---
// Ajusta esta interfaz para que coincida con la estructura de cómo guardas
// los tokens de Google en tu base de datos para cada usuario.
export interface UserIntegrationData {
  id?: number; // ID opcional si tu tabla tiene un campo 'id'
  userId: number;
  provider: 'GOOGLE_CALENDAR' | string; // 'GOOGLE_CALENDAR' es el valor que usaremos para esta integración
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null; // Fecha de expiración del accessToken\
  scope?: string; // Opcional, si necesitas guardar el scope
}

// --- Tipos de Entrada para las Funciones de Eventos ---

/**
 * Detalles para la creación o actualización de un evento de Google Calendar.
 */
export interface EventDetails {
  summary: string;
  description?: string;
  startDateTime: string; // Formato ISO 8601 (ej. '2025-06-05T10:00:00-05:00')
  endDateTime: string;   // Formato ISO 8601
  timeZone?: string;     // Ej. 'America/Bogota', 'America/New_York'. Por defecto se usa 'America/Bogota'.
  attendees?: string[];  // Array de correos electrónicos de asistentes.
}

// --- Configuración del Cliente OAuth2 de Google ---
const GOOGLE_CLIENT_ID: string = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET: string = process.env.PRIVATE_GOOGLE_SECRET_ID!;
const GOOGLE_REDIRECT_URI: string = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.error('ERROR: Las variables de entorno para Google OAuth2 (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI) deben estar configuradas.');
  // Considera lanzar un error o terminar el proceso si estas variables son críticas para el inicio.
}

const oauth2Client: OAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// --- Funciones Placeholder para la Interacción con tu ORM ---
/**
 * Busca y retorna los datos de integración de Google Calendar para un usuario específico.
 * @param {number} userId - El ID del usuario.
 * @returns {Promise<UserIntegrationData | null>} Los datos de integración del usuario o null si no se encuentran.
 *
 */
async function getUserIntegration(userId: number): Promise<UserIntegrationData | null> {
  const { data, error } = await supabaseClient
    .from(SUPABASE_TABLES.PROFILES_SECRETS)
    .select('*')
    .eq('userId', userId)
    .eq('provider', 'GOOGLE_CALENDAR')
    .single();

    if (error) {
        console.error(`Error al obtener la integración de Google Calendar para el usuario ${userId}:`, error.message);
        throw new Error(`No se pudo obtener la integración de Google Calendar: ${error.message}`);
    }

    if (!data) {
        console.warn(`No se encontraron datos de integración para el usuario ${userId}.`);
        return null; // No hay datos de integración para este usuario
    }

    return {
        id: data.id, // Asegúrate de que tu tabla tenga un campo 'id' si lo necesitas
        userId: data.userId,
        provider: data.provider,
        accessToken: data.token,
        refreshToken: data.refresh_token || null, // Puede ser null si no se ha guardado
        expiresAt: data.expires_at ? new Date(data.expires_at) : null, // Convertir a Date si es necesario
        scope: data.scope || undefined, // Puede ser undefined si no se ha guardado
    } as UserIntegrationData;
};

/**
 * **[DEBES IMPLEMENTAR ESTA FUNCIÓN CON TU ORM]**
 * Guarda o actualiza los datos de integración de Google Calendar para un usuario.
 * Esto es para almacenar el accessToken, refreshToken y expiresAt.
 * @param {number} userId - El ID del usuario.
 * @param {Partial<UserIntegrationData>} data - Los datos de integración a guardar/actualizar.
 * Usa `Partial` porque no siempre se enviarán todos los campos (ej. refreshToken solo en la primera auth).
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error al guardar los datos en la base de datos.
 */
async function saveUserIntegration(userId: number, data: Partial<UserIntegrationData>): Promise<void> {
    const { data: result, error } = await supabaseClient
        .from(SUPABASE_TABLES.PROFILES_SECRETS)
        .upsert({
            id: data.id, // Si estás usando un ID específico, asegúrate de pasarlo
            userId: userId,
            token: data.accessToken,
            refresh_token: data.refreshToken || undefined, // Guarda el refresh token si existe
            expires_at: data.expiresAt?.toISOString(), // Convert Date to ISO string
            provider: 'GOOGLE_CALENDAR',
            scope: data.scope || undefined, // Guarda el scope si existe
        });

    if (error) {
        throw error;
    }
    return;
}

// --- Funciones para la Gestión de Tokens y Clientes Autenticados ---

/**
 * Refresca el token de acceso de Google utilizando el refresh token almacenado.
 * Actualiza el access token y su fecha de expiración en la base de datos usando `saveUserIntegration`.
 * @param {string} userId - El ID del usuario.
 * @returns {Promise<OAuth2Client>} El cliente OAuth2 con el token de acceso actualizado.
 */
export async function refreshToken(userId: string): Promise<OAuth2Client> {
  try {
    const userIntegration: UserIntegrationData | null = await getUserIntegration(userId);

    if (!userIntegration || !userIntegration.refreshToken) {
      throw new Error('Refresh token no encontrado para el usuario. Por favor, vuelve a autenticarte con Google.');
    }

    oauth2Client.setCredentials({
      refresh_token: userIntegration.refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    // Actualizar el access token y su fecha de expiración en la base de datos
    // y el refresh token si Google devuelve uno nuevo (raro, pero posible)
    await saveUserIntegration(userId, {
      accessToken: credentials.access_token!,
      expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
      refreshToken: credentials.refresh_token || userIntegration.refreshToken, // Guarda el nuevo refresh token si se proporciona
    });

    oauth2Client.setCredentials(credentials);
    return oauth2Client;
  } catch (error: any) {
    console.error(`Error al refrescar el token para el usuario ${userId}:`, error.message);
    throw new Error(`No se pudo refrescar el token de Google: ${error.message}`);
  }
}

/**
 * Obtiene el cliente OAuth2 con el token de acceso actual o refrescado.
 * Esta función es la que deben llamar las demás funciones de la API de Calendar/Meet.
 * @param {string} userId - El ID del usuario.
 * @returns {Promise<OAuth2Client>} El cliente OAuth2 listo para usar.
 */
async function getAuthenticatedClient(userId: string): Promise<OAuth2Client> {
  const userIntegration: UserIntegrationData | null = await getUserIntegration(userId);

  if (!userIntegration || !userIntegration.accessToken) {
    // Si no hay token de acceso, intentar refrescarlo (o el usuario no ha autenticado)
    return refreshToken(userId);
  }

  const now = Date.now();
  const expiresAt = userIntegration.expiresAt?.getTime();

  // Si no hay expiresAt o si expira en menos de 5 minutos, refrescar
  if (!expiresAt || expiresAt < now + (5 * 60 * 1000)) { // 5 minutos de buffer
    console.log(`Token de acceso expirado o cerca de expirar para el usuario ${userId}. Refrescando...`);
    return refreshToken(userId);
  }

  // Si el token está fresco, usarlo directamente
  oauth2Client.setCredentials({
    access_token: userIntegration.accessToken,
    refresh_token: userIntegration.refreshToken,
    expiry_date: expiresAt,
  });

  return oauth2Client;
}


// --- Funciones para la Gestión de Google Meet y Calendar ---

/**
 * Crea un evento de Google Calendar con una videollamada de Google Meet.
 * @param {string} userId - El ID del usuario que crea la reunión.
 * @param {EventDetails} eventDetails - Detalles del evento.
 * @returns {Promise<calendar_v3.Schema$Event>} Los datos del evento creado, incluyendo el enlace de Google Meet.
 */
export async function createGoogleMeet(
  userId: string,
  eventDetails: EventDetails
): Promise<calendar_v3.Schema$Event> {
  try {
    const auth: OAuth2Client = await getAuthenticatedClient(userId);
    const calendar: calendar_v3.Calendar = google.calendar({ version: 'v3', auth });

    const event: calendar_v3.Schema$Event = {
      summary: eventDetails.summary,
      description: eventDetails.description,
      start: {
        dateTime: eventDetails.startDateTime,
        timeZone: eventDetails.timeZone || 'America/Bogota', // Zona horaria predeterminada
      },
      end: {
        dateTime: eventDetails.endDateTime,
        timeZone: eventDetails.timeZone || 'America/Bogota', // Zona horaria predeterminada
      },
      attendees: eventDetails.attendees?.map(email => ({ email: email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // ID único para la solicitud de Meet
          conferenceSolutionKey: {
            type: 'hangoutsMeet', // Especifica Google Meet
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 30 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary', // 'primary' para el calendario principal del usuario
      requestBody: event,    // Usar requestBody para TypeScript
      conferenceDataVersion: 1, // MUY IMPORTANTE: Habilita la creación de Google Meet
    });

    console.log('Google Meet creado:', response.data.hangoutLink);
    return response.data;
  } catch (error: any) {
    console.error('Error al crear Google Meet:', error.message);
    throw new Error(`No se pudo crear la reunión de Google Meet: ${error.message}`);
  }
}

/**
 * Cancela un evento de Google Calendar (y su Google Meet asociado).
 * @param {string} userId - El ID del usuario que creó el evento.
 * @param {string} eventId - El ID del evento a cancelar.
 * @returns {Promise<void>} No devuelve datos si la cancelación es exitosa.
 */
export async function cancelGoogleMeet(userId: string, eventId: string): Promise<void> {
  try {
    const auth: OAuth2Client = await getAuthenticatedClient(userId);
    const calendar: calendar_v3.Calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });

    console.log(`Evento de Google Meet ${eventId} cancelado.`);
  } catch (error: any) {
    console.error(`Error al cancelar Google Meet ${eventId}:`, error.message);
    throw new Error(`No se pudo cancelar la reunión de Google Meet: ${error.message}`);
  }
}

/**
 * Reagenda (actualiza) un evento de Google Calendar (y su Google Meet asociado).
 * @param {string} userId - El ID del usuario que creó el evento.
 * @param {string} eventId - El ID del evento a reagendar.
 * @param {Partial<EventDetails>} updatedDetails - Detalles actualizados del evento.
 * Usa Partial para permitir solo algunos campos.
 * @returns {Promise<calendar_v3.Schema$Event>} Los datos del evento actualizado.
 */
export async function rescheduleGoogleMeet(
  userId: string,
  eventId: string,
  updatedDetails: Partial<EventDetails>
): Promise<calendar_v3.Schema$Event> {
  try {
    const auth: OAuth2Client = await getAuthenticatedClient(userId);
    const calendar: calendar_v3.Calendar = google.calendar({ version: 'v3', auth });

    // Primero, obtener el evento actual para no sobrescribir propiedades no enviadas
    const existingEventResponse = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId,
    });

    const currentEvent: calendar_v3.Schema$Event = existingEventResponse.data;

    // Fusionar detalles actuales con los nuevos
    const updatedEvent: calendar_v3.Schema$Event = {
      ...currentEvent,
      summary: updatedDetails.summary || currentEvent.summary,
      description: updatedDetails.description || currentEvent.description,
      start: {
        dateTime: updatedDetails.startDateTime || currentEvent.start?.dateTime,
        timeZone: updatedDetails.timeZone || currentEvent.start?.timeZone,
      },
      end: {
        dateTime: updatedDetails.endDateTime || currentEvent.end?.dateTime,
        timeZone: updatedDetails.timeZone || currentEvent.end?.timeZone,
      },
      // Si se envían attendees, sobrescribir. Si no, mantener los existentes.
      attendees: updatedDetails.attendees
        ? updatedDetails.attendees.map(email => ({ email: email }))
        : currentEvent.attendees,
      // Asegurarse de mantener conferenceData si ya existe. Si no existe, crearla.
      conferenceData: currentEvent.conferenceData || {
        createRequest: {
          requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      reminders: currentEvent.reminders, // Se mantienen los recordatorios existentes si no se especifican nuevos
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: updatedEvent, // Usar requestBody para TypeScript
      conferenceDataVersion: 1, // Asegurarse de mantenerlo para Meet
    });

    console.log(`Evento de Google Meet ${eventId} reagendado:`, response.data.hangoutLink);
    return response.data;
  } catch (error: any) {
    console.error(`Error al reagendar Google Meet ${eventId}:`, error.message);
    throw new Error(`No se pudo reagendar la reunión de Google Meet: ${error.message}`);
  }
}