"use client";

import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { TbBell } from "react-icons/tb";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useProfileContext } from "@/context/ProfileContext";
import { useNotifications } from "@/hooks/useNotifications";

const Header = () => {
  const { signOut } = useAuth();
  const { clerkUser, role, profile } = useProfileContext();
  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [showBack, setShowBack] = useState(false);

  // Muestra la flecha de retroceso si hay historial y no es la home
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      pathname !== "/"
    ) {
      setShowBack(true);
    } else {
      setShowBack(false);
    }
  }, [pathname]);

  // Cierra los menús desplegables al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  // Si no hay usuario o perfil, no mostramos nada
  if (!clerkUser || !profile) return null;

  const profileImage = clerkUser.imageUrl || "/placeholder-profile.png";
  // Oculta el botón de perfil/login en páginas de autenticación
  const hideProfileOrLogin =
    pathname === "/auth/login" || pathname === "/auth/register";

  // NOTIFICACIONES: se obtienen para el perfil actual
  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
  } = useNotifications(profile.id, false);

  const hasNotifications = notifications && notifications.length > 0;

  // Función que determina la URL de redirección según el mensaje de la notificación
  const getRedirectUrl = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes("perfil") || lower.includes("completa")) {
      return `/perfil/${clerkUser.id}`;
    }
    return "/mis-clases";
  };

  const notificationsList = notificationsLoading ? (
    <div className="px-4 py-2 text-gray-700 text-sm">
      Cargando notificaciones...
    </div>
  ) : notificationsError ? (
    <div className="px-4 py-2 text-gray-700 text-sm">
      Error: {notificationsError}
    </div>
  ) : hasNotifications ? (
    notifications.map((notification) => {
      const href = getRedirectUrl(notification.message);
      return (
        <Link key={notification.id} href={href}>
          <span className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer text-sm">
            {notification.message}
          </span>
        </Link>
      );
    })
  ) : (
    <div className="px-4 py-2 text-gray-700 text-sm">
      No hay notificaciones
    </div>
  );

  return (
    <header className="bg-white shadow-sm z-1000">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {showBack && (
              <button
                onClick={() => router.back()}
                className="mr-2 p-2 rounded-full group hover:bg-gray-200 focus:outline-none focus:ring-2 focus:bg-secondary transition-all duration-200"
                aria-label="Volver"
              >
                <FaArrowLeft className="h-6 w-6 text-secondary group-focus:text-white" />
              </button>
            )}
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-1">
                <div className="w-5 h-5 relative flex items-start translate-y-[1px]">
                  <Image
                    src="/logo-primary.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="translate-y-[3px]">
                  <Image
                    src="/logo-text-primary.png"
                    alt="Logo Text"
                    width={140}
                    height={28}
                    className="h-7 w-auto"
                    priority
                  />
                </div>
              </Link>
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="hidden md:flex space-x-8">
            {role === "org:alumno" ? (
              <Link href="/browse-tutor">
                <button className="text-gray-600 px-3 py-2 text-sm font-medium font-archivo rounded-full hover:scale-105 hover:bg-primary hover:text-white transition-all duration-300 ease-in-out">
                  Encontrá un Profesor
                </button>
              </Link>
            ) : role === "org:profesor" ? (
              <Link href="/beneficios">
                <button className="text-gray-600 px-3 py-2 text-sm font-medium font-archivo rounded-full hover:scale-105 hover:bg-primary hover:text-white transition-all duration-300 ease-in-out">
                  Mis Beneficios
                </button>
              </Link>
            ) : null}
            <Link href="/contact-us">
              <button className="text-gray-600 px-3 py-2 text-sm font-medium font-archivo rounded-full hover:scale-105 hover:bg-primary hover:text-white transition-all duration-300 ease-in-out">
                Contacto
              </button>
            </Link>
            <Link href="/about-us">
              <button className="text-gray-600 px-3 py-2 text-sm font-medium font-archivo rounded-full hover:scale-105 hover:bg-primary hover:text-white transition-all duration-300 ease-in-out">
                Sobre Nosotros
              </button>
            </Link>
          </div>

          {/* Perfil y notificaciones */}
          {!hideProfileOrLogin && (
            <div className="flex items-center space-x-4 relative">
              {clerkUser ? (
                <>
                  {/* Campanita de notificaciones */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setNotificationsOpen(!isNotificationsOpen)
                      }
                      className="group relative focus:outline-none hover:bg-primary-hover hover:scale-105 rounded-full p-2 transition-all duration-200 ease-in-out"
                      aria-label="Notificaciones"
                    >
                      <TbBell className="w-6 h-6 text-gray-600 group-hover:text-white group-hover:scale-105 transition-all duration-200 ease-in-out" />
                      {hasNotifications && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white"></span>
                      )}
                    </button>
                    {/* Dropdown de notificaciones */}
                    <div
                      style={{ zIndex: 1000 }}
                      className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 transform transition-all duration-300 ease-in-out origin-top overflow-hidden ${
                        isNotificationsOpen
                          ? "opacity-100 scale-y-100"
                          : "opacity-0 scale-y-0"
                      }`}
                    >
                      {notificationsList}
                    </div>
                  </div>

                  {/* Perfil */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(!isMenuOpen)}
                      className="relative w-10 h-10 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary transition"
                      aria-label="Perfil"
                    >
                      <Image
                        src={profileImage}
                        alt="Foto de perfil"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </button>
                    {/* Dropdown de perfil */}
                    <div
                      style={{ zIndex: 1000 }}
                      className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 transform transition-all duration-300 ease-in-out origin-top overflow-hidden ${
                        isMenuOpen
                          ? "opacity-100 scale-y-100"
                          : "opacity-0 scale-y-0"
                      }`}
                    >
                      <Link href={`/perfil/${clerkUser.id}`}>
                        <span className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                          Perfil
                        </span>
                      </Link>
                      <Link href="/mis-clases">
                        <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                          Ver mis Clases
                        </button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => signOut()}
                        className="block px-4 py-2 text-red-500 hover:bg-gray-100 w-full text-left cursor-pointer"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link href="/auth/login">
                  <button className="flex items-center border border-primary text-primary hover:bg-primary hover:text-white transition duration-300 ease-in-out px-6 py-2 rounded-full text-sm font-semibold">
                    Iniciar Sesión
                    <FaArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
