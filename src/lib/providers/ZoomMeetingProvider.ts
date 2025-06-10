import { MeetingProvider, MeetingEventDetails, CreatedMeeting } from '@/interfaces/MeetingProvider';
import { UserIntegrationData } from '@/interfaces/UserIntegration';
import { getUserIntegration, saveUserIntegration } from '@/lib/utils/meet-provider'; // Ajusta la ruta


// --- Configuración de Zoom ---
const ZOOM_CLIENT_ID: string = process.env.ZOOM_CLIENT_ID!;
const ZOOM_CLIENT_SECRET: string = process.env.ZOOM_CLIENT_SECRET!;
const ZOOM_REDIRECT_URI: string = process.env.ZOOM_REDIRECT_URI!;

if (!ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET || !ZOOM_REDIRECT_URI) {
  console.error('ERROR: Las variables de entorno para Zoom OAuth2 (ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_REDIRECT_URI) deben estar configuradas.');
  throw new Error('Configuración de Zoom OAuth2 incompleta. Verifique sus variables de entorno.');
}

export class ZoomMeetingProvider extends MeetingProvider {
  private authHeader: string;
  private readonly providerName: string = 'ZOOM'; // Nombre específico para este proveedor

  constructor(userId: number) {
    super(userId);
    this.authHeader = 'Basic ' + Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
  }

  /**
   * Método interno para asegurar que el token de acceso de Zoom esté válido.
   * Carga desde la DB y refresca si es necesario.
   * @returns {Promise<string>} El token de acceso válido de Zoom.
   * @throws {Error} Si no se puede obtener o refrescar el token.
   */
  private async getValidAccessToken(): Promise<string> {
    const userIntegration: UserIntegrationData | null = await getUserIntegration(this.userId);

    if (!userIntegration || !userIntegration.accessToken) {
        // Si no hay token de acceso, o si el usuario nunca ha autenticado,
        // intentamos refrescar el token (que lo buscará y guardará si existe un refresh token).
        await this.refreshToken(); // Esto disparará la carga y guardado de tokens
        const refreshedIntegration = await getUserIntegration(this.userId);
        if (!refreshedIntegration?.accessToken) {
            throw new Error('No se pudo obtener un token de acceso válido para Zoom. Usuario no autenticado o token inválido.');
        }
        return refreshedIntegration.accessToken;
    }

    const now = Date.now();
    const expiresAtMs = userIntegration.expiresAt?.getTime();

    // Zoom tokens suelen expirar en 1 hora. Considerar un buffer.
    // Refrescar si expira en menos de 5 minutos o si no hay fecha de expiración.
    if (!expiresAtMs || expiresAtMs < now + (5 * 60 * 1000)) { // 5 minutos de buffer
      console.log(`Token de acceso de Zoom expirado o cerca de expirar para el usuario ${this.userId}. Refrescando...`);
      await this.refreshToken(); // Llama al método para refrescar
      const refreshedIntegration = await getUserIntegration(this.userId);
      if (!refreshedIntegration?.accessToken) {
        throw new Error('No se pudo refrescar el token de acceso de Zoom.');
      }
      return refreshedIntegration.accessToken;
    }

    return userIntegration.accessToken;
  }

  /**
   * Implementación concreta del método `refreshToken` de la clase abstracta para Zoom.
   * Refresca el token de acceso de Zoom y lo guarda en la base de datos usando `saveUserIntegration`.
   */
  public async refreshToken(): Promise<void> {
    try {
      const userIntegration: UserIntegrationData | null = await getUserIntegration(this.userId);

      if (!userIntegration || !userIntegration.refreshToken) {
        throw new Error('Refresh token de Zoom no encontrado. El usuario debe volver a autenticar su cuenta de Zoom.');
      }

      const res = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: userIntegration.refreshToken,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Error de API de Zoom al refrescar token: ${errorText}`);
        throw new Error('Error al refrescar el token de Zoom: ' + errorText);
      }

      const tokens = await res.json(); // tokens: { access_token, refresh_token, expires_in }

      // Calcular la fecha de expiración
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      // Guardar los nuevos credenciales en la base de datos de Supabase usando la función centralizada
      await saveUserIntegration(this.userId, {
        accessToken: tokens.access_token,
        expiresAt: expiresAt,
        refreshToken: tokens.refresh_token, // Zoom SÍ devuelve un nuevo refresh_token en cada refresh
        provider: this.providerName, // Aseguramos que el proveedor sea ZOOM
      });

    } catch (error: any) {
      console.error(`Error al refrescar el token de Zoom para el usuario ${this.userId}:`, error.message);
      throw new Error(`No se pudo refrescar el token de Zoom: ${error.message}. Por favor, intente reautenticar su cuenta.`);
    }
  }

  /**
   * Implementación concreta del método `createMeeting` para Zoom.
   */
  public async createMeeting(details: MeetingEventDetails): Promise<CreatedMeeting> {
    try {
      const accessToken = await this.getValidAccessToken();

      // Formato de datos para la API de Zoom
      const meetingData = {
        topic: details.summary,
        type: 2, // Programmed meeting
        start_time: details.startDateTime, // ISO 8601
        duration: Math.round((new Date(details.endDateTime).getTime() - new Date(details.startDateTime).getTime()) / (1000 * 60)), // duración en minutos
        timezone: details.timeZone || 'America/Bogota',
        agenda: details.description,
        settings: {
          host_video: false,
          participant_video: false,
          join_before_host: false,
          mute_participants_upon_entry: true,
        },
      };

      const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error de API de Zoom al crear la reunión:', errorBody);
        throw new Error('Error al crear la reunión de Zoom: ' + errorBody);
      }

      const zoomResponse = await res.json();

      if (!zoomResponse.id || !zoomResponse.join_url) {
        throw new Error('Zoom creó la reunión pero no se pudo obtener ID o Join URL.');
      }

      console.log('Reunión de Zoom creada:', zoomResponse.join_url);
      return {
        id: zoomResponse.id.toString(),
        joinUrl: zoomResponse.join_url,
        summary: zoomResponse.topic || details.summary,
        startDateTime: zoomResponse.start_time || details.startDateTime,
        endDateTime: new Date(new Date(zoomResponse.start_time).getTime() + zoomResponse.duration * 60 * 1000).toISOString() || details.endDateTime,
      };
    } catch (error: any) {
      console.error('Error al crear la reunión de Zoom:', error.message);
      throw new Error(`No se pudo crear la reunión de Zoom: ${error.message}`);
    }
  }

  /**
   * Implementación concreta del método `cancelMeeting` para Zoom.
   */
  public async cancelMeeting(meetingId: string): Promise<void> {
    try {
      const accessToken = await this.getValidAccessToken();

      const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`Error de API de Zoom al cancelar la reunión ${meetingId}:`, errorBody);
        throw new Error(`Error al cancelar la reunión de Zoom: ${errorBody}`);
      }

      console.log(`Reunión de Zoom ${meetingId} cancelada.`);
    } catch (error: any) {
      console.error(`Error al cancelar la reunión de Zoom ${meetingId}:`, error.message);
      throw new Error(`No se pudo cancelar la reunión de Zoom: ${error.message}`);
    }
  }

  /**
   * Implementación concreta del método `rescheduleMeeting` para Zoom.
   */
  public async rescheduleMeeting(
    meetingId: string,
    updatedDetails: Partial<MeetingEventDetails>
  ): Promise<CreatedMeeting> {
    try {
      const accessToken = await this.getValidAccessToken();

      const updatePayload: { [key: string]: any } = {};

      if (updatedDetails.summary !== undefined) updatePayload.topic = updatedDetails.summary;
      if (updatedDetails.description !== undefined) updatePayload.agenda = updatedDetails.description;
      if (updatedDetails.startDateTime !== undefined) updatePayload.start_time = updatedDetails.startDateTime;
      if (updatedDetails.timeZone !== undefined) updatePayload.timezone = updatedDetails.timeZone;

      // Calcular la duración si ambas fechas están presentes
      if (updatedDetails.startDateTime && updatedDetails.endDateTime) {
          updatePayload.duration = Math.round((new Date(updatedDetails.endDateTime).getTime() - new Date(updatedDetails.startDateTime).getTime()) / (1000 * 60));
      } else if (updatedDetails.startDateTime) {
          // Si solo se cambia la hora de inicio, podrías necesitar una llamada GET previa
          // para obtener la duración actual de la reunión y mantenerla.
          // Por ahora, si no se envía endDateTime, no actualizamos la duración explícitamente.
      }

      const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`Error de API de Zoom al reagendar la reunión ${meetingId}:`, errorBody);
        throw new Error(`Error al reagendar la reunión de Zoom: ${errorBody}`);
      }

      // La API de Zoom PATCH no devuelve el objeto de la reunión actualizada,
      // por lo que necesitamos hacer un GET para obtener los detalles actualizados.
      const getRes = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!getRes.ok) {
        const errorBody = await getRes.text();
        console.error(`Error al obtener detalles de reunión Zoom ${meetingId} después de reagendar:`, errorBody);
        throw new Error(`Error al verificar la reunión reagendada: ${errorBody}`);
      }
      const updatedZoomMeeting = await getRes.json();

      console.log(`Reunión de Zoom ${meetingId} reagendada.`);
      return {
        id: updatedZoomMeeting.id.toString(),
        joinUrl: updatedZoomMeeting.join_url,
        summary: updatedZoomMeeting.topic || updatedDetails.summary || '',
        startDateTime: updatedZoomMeeting.start_time || updatedDetails.startDateTime || '',
        endDateTime: new Date(new Date(updatedZoomMeeting.start_time).getTime() + updatedZoomMeeting.duration * 60 * 1000).toISOString() || updatedDetails.endDateTime || '',
      };
    } catch (error: any) {
      console.error(`Error al reagendar la reunión de Zoom ${meetingId}:`, error.message);
      throw new Error(`No se pudo reagendar la reunión de Zoom: ${error.message}`);
    }
  }
}