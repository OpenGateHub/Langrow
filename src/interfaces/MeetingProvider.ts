/**
 * Interfaz para los detalles de un evento de reunión.
 * Debe ser lo suficientemente genérica para adaptarse a diferentes proveedores.
 */
export interface MeetingEventDetails {
  summary: string;
  description?: string;
  startDateTime: string; // Formato ISO 8601
  endDateTime: string; // Formato ISO 8601
  timeZone?: string;
  attendees?: string[]; // Correos electrónicos
  // Añade aquí cualquier otro campo común que necesites para TODOS los proveedores
}

/**
 * Interfaz para los datos de una reunión creada por un proveedor.
 * Debería incluir la información mínima común para tu aplicación.
 */
export interface CreatedMeeting {
  id: string; // ID único de la reunión en el proveedor (ej. eventId de Google, meetingId de Zoom)
  joinUrl: string; // URL para unirse a la reunión
  summary: string;
  startDateTime: string;
  endDateTime: string;
  // Otros campos comunes
}

/**
 * Clase abstracta que define el contrato para cualquier proveedor de reuniones.
 * Las clases que la extiendan deben implementar todos sus métodos.
 */
export abstract class MeetingProvider {
  protected userId: number; // El ID de usuario se pasa al constructor de la clase base

  constructor(userId: number) {
    this.userId = userId;
  }

  /**
   * Intenta refrescar el token de acceso del proveedor.
   * Las implementaciones específicas se encargarán de la lógica de DB y API.
   * @returns {Promise<void>}
   * @throws {Error} Si el token no puede ser refrescado o no hay refresh token.
   */
  abstract refreshToken(): Promise<void>;

  /**
   * Crea una nueva reunión con el proveedor.
   * @param {MeetingEventDetails} details - Detalles del evento a crear.
   * @returns {Promise<CreatedMeeting>} La información de la reunión creada.
   * @throws {Error} Si la creación falla.
   */
  abstract createMeeting(details: MeetingEventDetails): Promise<CreatedMeeting>;

  /**
   * Cancela una reunión existente con el proveedor.
   * @param {string} meetingId - El ID de la reunión a cancelar (del proveedor).
   * @returns {Promise<void>}
   * @throws {Error} Si la cancelación falla.
   */
  abstract cancelMeeting(meetingId: string): Promise<void>;

  /**
   * Reagenda una reunión existente con el proveedor.
   * @param {string} meetingId - El ID de la reunión a reagendar.
   * @param {Partial<MeetingEventDetails>} updatedDetails - Detalles actualizados de la reunión.
   * @returns {Promise<CreatedMeeting>} La información actualizada de la reunión.
   * @throws {Error} Si la reagendación falla.
   */
  abstract rescheduleMeeting(
    meetingId: string,
    updatedDetails: Partial<MeetingEventDetails>
  ): Promise<CreatedMeeting>;
}
