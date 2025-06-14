# Middleware de Clerk para APIs

## Configuración del Middleware

El middleware de Clerk está configurado en `src/middleware.ts` para manejar la autenticación en todas las rutas de la aplicación, incluyendo las APIs.

### Rutas Públicas
Las siguientes rutas no requieren autenticación:
- `/` (página principal)
- `/auth/login`
- `/auth/register`
- `/auth/complete-profile`
- `/terms-of-service`
- `/privacy-policy`
- `/contact-us`
- `/api/webhook(.*)`
- `/api/health`

### Rutas de API Protegidas
Las siguientes rutas de API requieren autenticación:
- `/api/profile(.*)`
- `/api/auth/callback(.*)`
- `/api/zoom-meetings(.*)`
- `/api/class(.*)`
- `/api/notification(.*)`
- `/api/payments(.*)`
- `/api/mentoring(.*)`
- `/api/send-email(.*)`
- `/api/create-preference(.*)`
- `/api/administrator(.*)`

## Uso de Sesiones en Rutas de API

### Importar las funciones de Clerk

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';
```

### Obtener información del usuario autenticado

```typescript
export async function GET(req: NextRequest) {
  // Obtener el userId del usuario autenticado
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  
  // Usar el userId para consultas a la base de datos
  // ...
}
```

### Obtener información completa del usuario

```typescript
export async function POST(req: NextRequest) {
  // Obtener información completa del usuario
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  
  // Acceder a propiedades del usuario
  const email = user.emailAddresses[0]?.emailAddress;
  const firstName = user.firstName;
  const lastName = user.lastName;
  
  // ...
}
```

### Ejemplo completo de ruta protegida

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/app/api/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'No autorizado' }, 
        { status: 401 }
      );
    }
    
    // Realizar consulta usando el userId
    const { data, error } = await supabaseClient
      .from('UserProfile')
      .select('*')
      .eq('userId', userId)
      .single();
    
    if (error) {
      return NextResponse.json(
        { message: 'Error al consultar la base de datos' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json(
      { message: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}
```

## Funciones Disponibles

### `auth()`
Retorna un objeto con información básica de autenticación:
- `userId`: ID único del usuario en Clerk
- `sessionId`: ID de la sesión actual
- `orgId`: ID de la organización (si aplica)

### `currentUser()`
Retorna el objeto completo del usuario con toda la información disponible:
- `id`: ID del usuario
- `emailAddresses`: Array de direcciones de email
- `firstName`, `lastName`: Nombres del usuario
- `imageUrl`: URL de la imagen de perfil
- `publicMetadata`: Metadatos públicos
- `privateMetadata`: Metadatos privados
- Y muchas más propiedades...

## Manejo de Errores

El middleware automáticamente retorna un error 401 para rutas protegidas cuando:
- No hay sesión activa
- El token de sesión es inválido
- El usuario no está autenticado

Para rutas de API, siempre verifica la autenticación al inicio de tu función:

```typescript
const { userId } = await auth();
if (!userId) {
  return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
}
```

## Notas Importantes

1. **Todas las rutas de API están protegidas por defecto** excepto las marcadas como públicas
2. **El middleware se ejecuta antes que tus handlers de API**, por lo que la sesión ya está disponible
3. **Usa `userId` para relacionar datos** con el usuario autenticado en tu base de datos
4. **Las funciones `auth()` y `currentUser()` son asíncronas**, siempre usa `await` 