import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define las rutas públicas que no requieren autenticación
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/complete-profile',
  '/terms-of-service',
  '/privacy-policy',
  '/contact-us',
  '/api/webhook(.*)', // Webhooks generalmente no requieren autenticación de usuario
  '/api/health', // Ruta de salud si la tienes
]);

// Define las rutas de API que requieren autenticación
const isProtectedApiRoute = createRouteMatcher([
  '/api/profile(.*)',
  '/api/auth/callback(.*)',
  '/api/zoom-meetings(.*)',
  '/api/class(.*)',
  '/api/notification(.*)',
  '/api/payments(.*)',
  '/api/mentoring(.*)',
  '/api/send-email(.*)',
  '/api/create-preference(.*)',
  '/api/administrator(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
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
