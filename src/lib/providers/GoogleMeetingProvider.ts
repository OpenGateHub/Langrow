import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getUserIntegration, saveUserIntegration } from '@/lib/utils/meet-provider';
import { MeetingProvider, MeetingEventDetails, CreatedMeeting } from '@/interfaces/MeetingProvider'
import { UserIntegrationData } from '@/interfaces/UserIntegration';


// --- Configuración del Cliente OAuth2 de Google ---
const GOOGLE_CLIENT_ID: string = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET: string = process.env.PRIVATE_GOOGLE_SECRET_ID!;
const GOOGLE_REDIRECT_URI: string = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.error('ERROR: Las variables de entorno para Google OAuth2 (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI) deben estar configuradas.');
  throw new Error('Configuración de Google OAuth2 incompleta. Verifique sus variables de entorno.');
}


export class GoogleMeetingProvider extends MeetingProvider {
  private oauth2Client: OAuth2Client;
  private readonly providerName: string = 'GOOGLE_CALENDAR'; 

  constructor(userId: number) {
    super(userId); // Llama al constructor de la clase base
    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Método interno para asegurar que el cliente OAuth2 esté autenticado y con un token válido.
   * Refresca el token si es necesario antes de devolver el cliente.
   * @returns {Promise<OAuth2Client>} El cliente OAuth2 listo para usar.
   */
  private async getAuthenticatedClient(): Promise<OAuth2Client> {
    const userIntegration: UserIntegrationData | null = await getUserIntegration(this.userId);

    if (!userIntegration || !userIntegration.accessToken) {
      // Si no hay token de acceso, o si el usuario nunca ha autenticado,
      // intentamos refrescar el token (que lo buscará y guardará si existe un refresh token).
      await this.refreshToken(); // Esto actualizará `this.oauth2Client` con las credenciales
      return this.oauth2Client;
    }

    const now = Date.now();
    const expiresAtMs = userIntegration.expiresAt?.getTime();

    // Si el token ha expirado o está cerca de expirar (menos de 5 minutos de buffer), refrescar
    if (!expiresAtMs || expiresAtMs < now + (5 * 60 * 1000)) {
      console.log(`Token de acceso de Google expirado o cerca de expirar para el usuario ${this.userId}. Refrescando...`);
      await this.refreshToken(); // Llama al método abstracto para refrescar
    } else {
      // Si el token está fresco, configurarlo en el cliente
      this.oauth2Client.setCredentials({
        access_token: userIntegration.accessToken,
        refresh_token: userIntegration.refreshToken,
        expiry_date: expiresAtMs,
      });
    }

    return this.oauth2Client;
  }

  /**
   * Implementación concreta del método `refreshToken` de la clase abstracta.
   * Refresca el token de acceso de Google y lo guarda en la base de datos usando Supabase.
   */
  public async refreshToken(): Promise<void> {
    try {
      const userIntegration: UserIntegrationData | null = await getUserIntegration(this.userId);

      if (!userIntegration || !userIntegration.refreshToken) {
        throw new Error('Refresh token de Google no encontrado. El usuario debe volver a autenticar su cuenta de Google.');
      }

      this.oauth2Client.setCredentials({
        refresh_token: userIntegration.refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      // Guardar los nuevos credenciales en la base de datos de Supabase
      await saveUserIntegration(this.userId, {
        accessToken: credentials.access_token!,
        expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
        refreshToken: credentials.refresh_token || userIntegration.refreshToken, // Mantener el mismo si no se devuelve uno nuevo
        provider: this.providerName,
      });

      // Actualizar las credenciales internas de la instancia de OAuth2Client
      this.oauth2Client.setCredentials(credentials);

    } catch (error: any) {
      console.error(`Error al refrescar el token de Google para el usuario ${this.userId}:`, error.message);
      // Es crucial manejar casos donde el refresh token sea inválido (ej. usuario lo revocó)
      // Podrías limpiar el refresh token en la DB y forzar al usuario a reautenticar.
      throw new Error(`No se pudo refrescar el token de Google. Causa: ${error.message}. Por favor, intente reautenticar su cuenta.`);
    }
  }

  /**
   * Implementación concreta del método `createMeeting` para Google Meet.
   */
  public async createMeeting(details: MeetingEventDetails): Promise<CreatedMeeting> {
    try {
      const auth = await this.getAuthenticatedClient();
      const calendar = google.calendar({ version: 'v3', auth });

      const event: calendar_v3.Schema$Event = {
        summary: details.summary,
        description: details.description,
        start: {
          dateTime: details.startDateTime,
          timeZone: details.timeZone || 'America/Bogota', // Zona horaria predeterminada
        },
        end: {
          dateTime: details.endDateTime,
          timeZone: details.timeZone || 'America/Bogota', // Zona horaria predeterminada
        },
        attendees: details.attendees?.map(email => ({ email: email })),
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
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
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
      });

      if (!response.data.id || !response.data.hangoutLink) {
        throw new Error('Google Meet se creó pero no se pudo obtener ID o Join URL.');
      }

      console.log('Google Meet creado:', response.data.hangoutLink);
      return {
        id: response.data.id,
        joinUrl: response.data.hangoutLink,
        summary: response.data.summary || details.summary,
        startDateTime: response.data.start?.dateTime || details.startDateTime,
        endDateTime: response.data.end?.dateTime || details.endDateTime,
      };
    } catch (error: any) {
      console.error('Error al crear Google Meet:', error.message);
      throw new Error(`No se pudo crear la reunión de Google Meet: ${error.message}`);
    }
  }

  /**
   * Implementación concreta del método `cancelMeeting` para Google Meet.
   */
  public async cancelMeeting(meetingId: string): Promise<void> {
    try {
      const auth = await this.getAuthenticatedClient();
      const calendar = google.calendar({ version: 'v3', auth });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: meetingId,
      });

      console.log(`Evento de Google Meet ${meetingId} cancelado.`);
    } catch (error: any) {
      console.error(`Error al cancelar Google Meet ${meetingId}:`, error.message);
      throw new Error(`No se pudo cancelar la reunión de Google Meet: ${error.message}`);
    }
  }

  /**
   * Implementación concreta del método `rescheduleMeeting` para Google Meet.
   */
  public async rescheduleMeeting(
    meetingId: string,
    updatedDetails: Partial<MeetingEventDetails>
  ): Promise<CreatedMeeting> {
    try {
      const auth = await this.getAuthenticatedClient();
      const calendar = google.calendar({ version: 'v3', auth });

      // Primero, obtener el evento actual para no sobrescribir propiedades no enviadas
      const existingEventResponse = await calendar.events.get({
        calendarId: 'primary',
        eventId: meetingId,
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
        attendees: updatedDetails.attendees
          ? updatedDetails.attendees.map(email => ({ email: email }))
          : currentEvent.attendees,
        conferenceData: currentEvent.conferenceData || {
          createRequest: {
            requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
        reminders: currentEvent.reminders,
      };

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: meetingId,
        requestBody: updatedEvent,
        conferenceDataVersion: 1,
      });

      if (!response.data.id || !response.data.hangoutLink) {
        throw new Error('Google Meet se reagendó pero no se pudo obtener ID o Join URL.');
      }

      console.log(`Evento de Google Meet ${meetingId} reagendado:`, response.data.hangoutLink);
      return {
        id: response.data.id,
        joinUrl: response.data.hangoutLink,
        summary: response.data.summary || updatedDetails.summary || '',
        startDateTime: response.data.start?.dateTime || updatedDetails.startDateTime || '',
        endDateTime: response.data.end?.dateTime || updatedDetails.endDateTime || '',
      };
    } catch (error: any) {
      console.error(`Error al reagendar Google Meet ${meetingId}:`, error.message);
      throw new Error(`No se pudo reagendar la reunión de Google Meet: ${error.message}`);
    }
  }
}