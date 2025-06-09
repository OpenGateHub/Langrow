/**
 *  Interfaz que representa los datos de integración de un usuario con un proveedor externo.
 *  con el modelo de la base de datos 
 */
export interface UserIntegrationData {
    id?: number; 
    userId: number;
    provider: 'GOOGLE_CALENDAR' | string;
    accessToken: string;
    refreshToken: string | null;
    expiresAt: Date | null;
    scope?: string;
};