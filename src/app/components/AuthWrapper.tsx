"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useProfileContext } from "@/context/ProfileContext";
import LoadingScreen from './LoadingScreen';
import BlockUi from './BlockUi';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { profile, loading: profileLoading, error } = useProfileContext();
  const router = useRouter();
  const pathname = usePathname();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [redirectionInProgress, setRedirectionInProgress] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  // Almacenamos en localStorage si ya se ha completado el perfil
  useEffect(() => {
    if (profile && !hasCheckedProfile) {
      localStorage.setItem('hasProfile', 'true');
      setHasCheckedProfile(true);
    }
  }, [profile, hasCheckedProfile]);

  const publicRoutes = [
    '/',
    '/auth',
    '/auth/login',
    '/auth/register',
    '/auth/complete-profile',
    '/terms-of-service',
    '/privacy-policy',
    '/contact-us',
    '/home',
  ];

  // Rutas específicas donde no deberíamos redirigir a complete-profile
  const skipProfileCheckRoutes = [
    '/payment/success',
    '/payment/failure',
    '/api/auth/callback/google',
    '/class',
    '/auth/register',
    '/home',
    '/auth/complete-profile',
  ];

  const isPublicRoute = publicRoutes.includes(pathname);
  const shouldSkipProfileCheck = skipProfileCheckRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    // Si ya estamos en medio de una redirección o la verificación inicial ya se completó, no hacer nada
    if (redirectionInProgress || !isLoaded || initialCheckDone) return;

    // Si el usuario no está autenticado y no está en una ruta pública, redirigir a auth
    if (!isSignedIn && !isPublicRoute) {
      setRedirectionInProgress(true);
      router.push('/auth');
      setInitialCheckDone(true);
      return;
    }

    // Si el usuario está autenticado, verificar redirecciones solo una vez
    if (isSignedIn && user && !profileLoading) {
      // Solo redirigir a complete-profile si el usuario se registró con Google (tiene firstName/lastName pero no rol)
      const hasGoogleData = user?.firstName && user?.lastName;
      const hasRole = user?.publicMetadata?.role || user?.unsafeMetadata?.formRole;
      const hasStoredProfile = localStorage.getItem('hasProfile') === 'true';
      
      // Verificar si el usuario se registró con Google (tiene externalId)
      const isGoogleUser = user.externalAccounts && user.externalAccounts.length > 0;
      
      // Si hay un error al cargar el perfil o no hay perfil y no hay registro en localStorage
      if ((error || !profile) && !hasStoredProfile && pathname !== '/auth/complete-profile') {
        // Solo redirigir a complete-profile si es un usuario de Google y no estamos en el proceso de registro
        if (isGoogleUser && pathname !== '/auth/register' && pathname !== '/home' && pathname !== '/auth/complete-profile') {
          setRedirectionInProgress(true);
          router.push('/auth');
          setInitialCheckDone(true);
          return;
        }
        // Si no es usuario de Google y no tiene perfil, podría ser un error - redirigir al home
        else if (!isGoogleUser && pathname !== '/auth/register' && pathname !== '/home') {
          setRedirectionInProgress(true);
          router.push('/home');
          setInitialCheckDone(true);
          return;
        }
        // Si no es usuario de Google y no tiene perfil, podría ser un error - redirigir al home
        else if (!isGoogleUser && pathname !== '/auth/register' && pathname !== '/home') {
          setRedirectionInProgress(true);
          router.push('/home');
          setInitialCheckDone(true);
          return;
        }
      }

      // Si tiene rol completo y está en auth, redirigir al home
      const hasCompleteRole = user?.publicMetadata?.role || user?.unsafeMetadata?.formRole;
      if (hasCompleteRole && (pathname === '/auth/complete-profile' || pathname === '/auth')) {
        setRedirectionInProgress(true);
        router.push('/home');
        setInitialCheckDone(true);
        return;
      }
      
      // Si tiene perfil en BD y está en auth, redirigir al home
      if (profile && (pathname === '/auth/complete-profile' || pathname === '/auth')) {
        setRedirectionInProgress(true);
        router.push('/home');
        setInitialCheckDone(true);
        return;
      }

      setInitialCheckDone(true);
    }

    // Si la carga ha finalizado, marcar como completada
    if (!profileLoading) {
      setInitialCheckDone(true);
    }
  }, [isLoaded, isSignedIn, user, profile, profileLoading, pathname, router, isPublicRoute, initialCheckDone, redirectionInProgress]);

  // Después de completar una redirección, resetear el estado
  useEffect(() => {
    if (redirectionInProgress && initialCheckDone) {
      setRedirectionInProgress(false);
    }
  }, [redirectionInProgress, initialCheckDone]);


  // Mostrar loading solo si Clerk no está cargado
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BlockUi isActive={true} />
      </div>
    );
  }
  
  // Solo mostrar loading si no estamos en home y el perfil está cargando
  if (isSignedIn && profileLoading && !initialCheckDone && pathname !== '/home') {
    return (
      <div className="min-h-screen bg-gray-100">
        <BlockUi isActive={true} />
      </div>
    );
  }

  // Permitir acceso al home incluso si el perfil está cargando
  if (isSignedIn && pathname === '/home') {
    // Si el perfil está cargando, mostrar un loading sutil
    if (profileLoading && !initialCheckDone) {
      return (
        <div className="min-h-screen bg-gray-100">
          <BlockUi isActive={true} />
        </div>
      );
    }
    return <>{children}</>;
  }

  // Si el usuario está autenticado pero cargando el perfil, mostrar la página sin pantalla de carga
  // El perfil se cargará en segundo plano

  // Para el resto de casos, mostrar el contenido y dejar que cada página maneje su propio loading
  return <>{children}</>;
}
