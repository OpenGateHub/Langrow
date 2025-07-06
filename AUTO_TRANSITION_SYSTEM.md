# Sistema de Transiciones Automáticas de Clases

## Descripción

Este sistema maneja automáticamente las transiciones de estado de las clases cuando terminan, cambiando su estado de "NEXT" (por pasar) a "NOTCONFIRMED" (pendiente de calificación) y generando notificaciones para que los usuarios califiquen sus experiencias.

## Flujo del Sistema

### 1. Estados de las Clases

- **REQUESTED**: Clase solicitada, pendiente de aceptación
- **NEXT**: Clase confirmada, próxima a realizarse
- **NOTCONFIRMED**: Clase terminada, pendiente de calificación
- **CONFIRMED**: Clase calificada y completada
- **CANCELLED**: Clase cancelada
- **REJECTED**: Clase rechazada

### 2. Transición Automática

Cuando una clase en estado "NEXT" alcanza su hora de finalización (`endsAt`), el sistema:

1. **Cambia automáticamente** el estado a "NOTCONFIRMED"
2. **Genera notificaciones** para el estudiante y profesor
3. **Dirige a los usuarios** a la pestaña "Revisar" para calificar

### 3. Notificaciones

Las notificaciones incluyen:
- Mensaje personalizado con el título de la clase
- Enlace directo a `/mis-clases?tab=Revisar`
- Se muestran en el header de la aplicación

## Componentes del Sistema

### Endpoints API

#### `/api/mentoring/auto-transition` (POST)
- Ejecuta las transiciones automáticas
- Busca clases en estado "NEXT" que ya terminaron
- Actualiza su estado a "NOTCONFIRMED"
- Crea notificaciones para estudiantes y profesores

#### `/api/mentoring/auto-transition` (GET)
- Obtiene clases pendientes de calificación para un usuario
- Filtra por estado "NOTCONFIRMED"

#### `/api/mentoring/test-transition` (POST)
- Endpoint de prueba para simular transiciones
- Permite cambiar la fecha de finalización de una clase al pasado

### Hooks

#### `useAutoTransition`
- Maneja las transiciones automáticas
- Proporciona funciones para ejecutar y programar transiciones
- Se ejecuta cada 5 minutos automáticamente

### Componentes

#### `AutoTransitionHandler`
- Componente invisible que se ejecuta en el layout principal
- Maneja las transiciones automáticas en segundo plano
- Se ejecuta al cargar la página y cada 5 minutos

#### `TestTransitionButton`
- Botón de prueba para simular transiciones
- Aparece en las clases en estado "Próximas"
- Permite probar el sistema manualmente

## Configuración

### Frecuencia de Ejecución
Las transiciones automáticas se ejecutan:
- Al cargar cualquier página de la aplicación
- Cada 5 minutos automáticamente
- Se puede ajustar en `useAutoTransition.ts`

### Mensajes de Notificación
Los mensajes se pueden personalizar en `/api/mentoring/auto-transition/route.ts`:

```typescript
// Para estudiantes
`¡Tu clase "${classItem.title}" ha terminado! Por favor, califica tu experiencia con el profesor.`

// Para profesores  
`¡Tu clase "${classItem.title}" ha terminado! Por favor, califica tu experiencia con el estudiante.`
```

## Uso

### Ejecución Automática
El sistema funciona automáticamente sin intervención manual. Las transiciones se ejecutan:
1. Al cargar la aplicación
2. Cada 5 minutos en segundo plano

### Pruebas Manuales
Para probar el sistema manualmente:

1. Ve a la página "Mis Clases"
2. Selecciona la pestaña "Próximas"
3. Haz clic en "Simular Transición" en cualquier clase
4. La clase se moverá automáticamente a "Revisar"
5. Se generarán notificaciones

### Navegación por Notificaciones
Cuando recibas una notificación:
1. Haz clic en la notificación
2. Serás dirigido automáticamente a `/mis-clases?tab=Revisar`
3. Podrás calificar la clase que acaba de terminar

## Estructura de Archivos

```
src/
├── app/
│   ├── api/
│   │   └── mentoring/
│   │       ├── auto-transition/
│   │       │   └── route.ts          # Endpoint principal
│   │       └── test-transition/
│   │           └── route.ts          # Endpoint de prueba
│   ├── components/
│   │   ├── AutoTransitionHandler.tsx # Manejador automático
│   │   └── TestTransitionButton.tsx  # Botón de prueba
│   └── layout.tsx                    # Integración del sistema
├── hooks/
│   └── useAutoTransition.ts          # Hook personalizado
└── types/
    └── classRoom.ts                  # Definición de estados
```

## Monitoreo

### Logs
El sistema genera logs en la consola del navegador:
- Transiciones ejecutadas
- Clases procesadas
- Notificaciones enviadas
- Errores (si los hay)

### Métricas
El endpoint de transición devuelve:
- Número de clases procesadas
- Número de notificaciones enviadas
- Detalles de las operaciones realizadas

## Consideraciones

### Rendimiento
- Las transiciones se ejecutan en segundo plano
- No afectan la experiencia del usuario
- Se optimizan para evitar consultas innecesarias

### Seguridad
- Solo se procesan clases que realmente han terminado
- Las notificaciones se envían solo a usuarios autorizados
- Se validan todos los datos antes de procesar

### Escalabilidad
- El sistema está diseñado para manejar múltiples clases
- Se puede ajustar la frecuencia de ejecución
- Se pueden agregar más estados si es necesario 