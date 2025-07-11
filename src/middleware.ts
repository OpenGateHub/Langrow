import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define las rutas públicas que no requieren autenticación
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/reset-password(.*)', // Agregar ruta de recuperación de contraseña
  '/api/auth/callback(.*)',
  '/auth/complete-profile(.*)',
  '/home', // Permitir acceso al home para usuarios recién registrados
  '/terms-of-service',
  '/privacy-policy',
  '/contact-us',
  '/api/webhook(.*)', // Webhooks generalmente no requieren autenticación de usuario
  '/api/health', // Ruta de salud si la tienes
  
  '/api/mentoring(.*)',
]);

// Define las rutas de API que requieren autenticación
const isProtectedApiRoute = createRouteMatcher([
  '/api/profile/me(.*)',
  '/api/zoom-meetings(.*)',
  '/api/class(.*)',
  '/api/notification(.*)',
  '/api/payments(.*)',
  '/api/send-email(.*)',
  '/api/create-preference(.*)',
  '/api/administrator(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Permitir POST a /api/profile para registro de usuarios
  if (req.method === 'POST' && req.nextUrl.pathname === '/api/profile') {
    return;
  }

  // Proteger rutas específicas de perfil (GET /api/profile/[id])
  if (req.nextUrl.pathname.startsWith('/api/profile/') && req.nextUrl.pathname !== '/api/profile/') {
    const authObj = await auth();
    if (!authObj.userId) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  // Si es una ruta de API protegida, protegerla
  if (isProtectedApiRoute(req)) {
    const authObj = await auth();
    if (!authObj.userId) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  // Si no es una ruta pública y no es una ruta de API, protegerla
  if (!isPublicRoute(req) && !req.nextUrl.pathname.startsWith('/api/')) {
    const authObj = await auth();
    if (!authObj.userId) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
});

export const config = {
  matcher: [
    // Excluir archivos estáticos y Next.js internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Incluir todas las rutas de API
    '/(api|trpc)(.*)',
  ],
};
