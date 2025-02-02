"use client";

import Link from "next/link";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import { useUser, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { usePathname } from "next/navigation";

const Header = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname(); 

  if (!isLoaded) return null; // Hide the header until the user state is loaded

  const role = user?.publicMetadata?.role || "guest";
  const profileImage = user?.imageUrl || "/placeholder-profile.png";

  // Hide profile/login button on specific pages
  const hideProfileOrLogin = pathname === "/auth/login" || pathname === "/auth/register";

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

          {/* Navigation Buttons */}
          <div className="hidden md:flex space-x-8">
            <Link href="/browse-tutor">
              <button className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium font-archivo">
                Encontrá un Profesor
              </button>
            </Link>
            <Link href="/contact-us">
              <button className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium font-archivo">
                Contacto
              </button>
            </Link>
            <Link href="/about-us">
              <button className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium font-archivo">
                Sobre Nosotros
              </button>
            </Link>
          </div>

          {/* Profile Image or Login Button */}
          {!hideProfileOrLogin && (
            <div className="relative">
              {isSignedIn ? (
                <div>
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

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <Link href="/profile">
                        <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                          Perfil
                        </button>
                      </Link>
                      {role === "profesor" && (
                        <Link href="/teacher/calendar">
                          <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                            Ver mi Calendario
                          </button>
                        </Link>
                      )}
                      {role === "alumno" && (
                        <Link href="/student/classes">
                          <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                            Ver mis Clases
                          </button>
                        </Link>
                      )}
                      {role === "admin" && (
                        <Link href="/admin/impersonate">
                          <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                            Impersonar
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()} 
                        className="block px-4 py-2 text-red-500 hover:bg-gray-100 w-full text-left"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
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
