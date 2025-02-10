"use client";

import Link from "next/link";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import { TbBell } from "react-icons/tb";

import { useUser, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const Header = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();

  // Cierra los menús desplegables al cambiar de ruta para evitar inconsistencias
  useEffect(() => {
    setMenuOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  if (!isLoaded) return null; // Espera a que se cargue el estado del usuario

  const role = user?.unsafeMetadata?.role || "guest";
  const profileImage = user?.imageUrl || "/placeholder-profile.png";

  // Ocultar el botón de perfil/login en ciertas páginas
  const hideProfileOrLogin =
    pathname === "/auth/login" || pathname === "/auth/register";

  /* Variables de notificaciones (a completar con datos reales) */
  // Para profesor
  const isTeacherRequest = false; // Cuando un alumno solicita clase
  const isTeacherScheduled = false; // Cuando se agenda la clase
  const isTeacherConfirm = false;   // Cuando se requiere confirmar la clase

  // Para alumno
  const isStudentConfirmed = false; // Cuando la clase con el profe fue confirmada
  const isStudentReagend = false;   // Cuando la clase fue reagendada
  const isStudentConfirm = false;   // Cuando se requiere confirmar la clase con el tutor

  // Nombres de ejemplo (a reemplazar con datos reales)
  const studentName = "";     // Ejemplo: "Juan"
  const studentLastName = ""; // Ejemplo: "Pérez"
  const teacherName = "";     // Ejemplo: "María"
  const teacherLastName = ""; // Ejemplo: "González"

  // Determina si hay notificaciones
  const hasNotifications =
    (role === "org:profesor" &&
      (isTeacherRequest || isTeacherScheduled || isTeacherConfirm)) ||
    (role === "org:alumno" &&
      (isStudentConfirmed || isStudentReagend || isStudentConfirm));

  // Contenido de las notificaciones
  let notificationsList = null;
  if (role === "org:profesor") {
    notificationsList = (
      <>
        {isTeacherRequest && (
          <Link href="/mis-clases">
            <span className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer text-sm">
              El alumno {studentName} {studentLastName} quiere tener una clase.
            </span>
          </Link>
        )}
        {isTeacherScheduled && (
          <Link href="/mis-clases">
            <span className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer text-sm">
              Se agendó la clase con {studentName} {studentLastName}!
            </span>
          </Link>
        )}
        {isTeacherConfirm && (
          <Link href="/mis-clases">
            <span className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer text-sm">
              Confirma tu clase con {studentName} {studentLastName}.
            </span>
          </Link>
        )}
      </>
    );
  } else if (role === "org:alumno") {
    notificationsList = (
      <>
        {isStudentConfirmed && (
          <Link href="/mis-clases">
            <span className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer text-sm">
              Tu clase con {teacherName} {teacherLastName} fue confirmada!
            </span>
          </Link>
        )}
        {isStudentReagend && (
          <Link href="/mis-clases">
            <span className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer text-sm">
              Tu clase con {teacherName} {teacherLastName} fue reagendada.
            </span>
          </Link>
        )}
        {isStudentConfirm && (
          <Link href="/mis-clases">
            <span className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer text-sm">
              Confirma tu clase con {teacherName} {teacherLastName}.
            </span>
          </Link>
        )}
      </>
    );
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
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

          {/* Botones de navegación */}
          <div className="hidden md:flex space-x-8">
            {role === "org:alumno" ? (
              <Link href="/browse-tutor">
                <button className="text-gray-600 px-3 py-2 text-sm font-medium font-archivo rounded-full hover:scale-105 hover:bg-primary hover:text-white transition-all duration-300 ease-in-out ">
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
              {isSignedIn ? (
                <>
                  {/* Campanita de notificaciones */}
                  <div className="relative">
                    <button
                      onClick={() => setNotificationsOpen(!isNotificationsOpen)}
                      className="group relative focus:outline-none hover:bg-primary-hover hover:scale-105 rounded-full p-2 transition-all duration-200 ease-in-out"
                    >
                      <TbBell className="w-6 h-6 text-gray-600 group-hover:text-white group-hover:scale-105 transition-all duration-200 ease-in-out" />
                      {hasNotifications && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white"></span>
                      )}
                    </button>
                    {/* Dropdown de notificaciones */}

                    <div className={`absolute right-0 mt-2  w-48 bg-white rounded-lg shadow-lg py-2 z-50 transform transition-all duration-300 ease-in-out origin-top overflow-hidden ${isNotificationsOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                      }`}>
                      {hasNotifications ? (
                        notificationsList
                      ) : (
                        <div className="px-4 py-2 text-gray-700 text-sm">
                          No hay notificaciones
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Perfil */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(!isMenuOpen)}
                      className="relative w-10 h-10 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
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

                    <div className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 transform transition-all duration-300 ease-in-out origin-top overflow-hidden ${isMenuOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                      }`}>
                        <Link href={`/perfil/${user.id}`}>
                        <span className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                          Perfil
                        </span>
                      </Link>
                      <Link href="/mis-clases">
                        <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                          Ver mis Clases
                        </button>
                      </Link>

                      {role === "admin" && (
                        <Link href="/admin/impersonate">
                          <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                            Impersonar
                          </button>
                        </Link>
                      )}
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
