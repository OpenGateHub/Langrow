"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk, useSignIn, SignInButton, useUser } from "@clerk/nextjs";
import BlockUi from "@/app/components/BlockUi";

export default function LoginPage() {
  const router = useRouter();
  const clerk = useClerk();
  const { isSignedIn, isLoaded: userLoaded, user } = useUser();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para el modal de recuperación de contraseña
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Redirige cuando Clerk ya cargó y el usuario está autenticado
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      // Si el usuario no tiene rol, redirigir a completar perfil
      if (!user?.publicMetadata?.role) {
        router.push("/auth/complete-profile");
      } else {
        router.push("/home");
      }
    }
  }, [userLoaded, isSignedIn, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!signInLoaded) return;
    setErrorMessage(null);

    try {
      const { email, password } = formData;
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        // Activa la sesión en el cliente usando useClerk
        await clerk.setActive({ session: result.createdSessionId });
        // Redirige según si tiene rol o no
        const user = clerk.user;
        if (!user?.publicMetadata?.role) {
          router.push("/auth/complete-profile");
        } else {
          router.push("/home");
        }
      } else {
        console.log(result);
      }
    } catch (err: any) {
      setErrorMessage(err?.errors?.[0]?.message || "Error al iniciar sesión");
      console.error("Error al iniciar sesión:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordMessage(null);

    if (!signInLoaded) {
      setForgotPasswordMessage({
        type: 'error',
        text: "Sistema no disponible en este momento"
      });
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const result = await signIn.create({
        identifier: forgotPasswordEmail,
        strategy: "reset_password_email_code",
      });

      if (result.status === "needs_first_factor") {
        // Redirigir a la página de reset-password con el email
        router.push(`/auth/reset-password?email=${encodeURIComponent(forgotPasswordEmail)}&sent=true`);
      } else {
        setForgotPasswordMessage({
          type: 'error',
          text: "Error inesperado en el proceso"
        });
      }
    } catch (err: any) {
      setForgotPasswordMessage({
        type: 'error',
        text: err?.errors?.[0]?.message || "Error al enviar el código de verificación"
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative">
      <BlockUi isActive={loading} />
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg-login.jpg"
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
          className="opacity-80"
        />
      </div>

      <div className="bg-white bg-opacity-70 shadow-lg rounded-3xl flex flex-col w-4/5 max-w-md overflow-hidden p-8 sm:p-12 my-4">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo-primary.png" width={40} height={40} alt="logo" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold mb-6 text-center">
          ¡Bienvenido a Langrow!
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@gmail.com"
              className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
            />
            <div className="mt-1 text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-secondary hover:text-secondary-hover hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="w-full bg-secondary hover:bg-primary-hover text-white font-bold py-2 rounded-md shadow-sm transition"
          >
            Inicia Sesión
          </button>
        </form>

        <div className="flex items-center justify-between mt-6">
          {/* Botón para iniciar sesión con Google */}
          <SignInButton mode="redirect">
            <button className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm hover:bg-gray-200 transition duration-200">
              <img src="/google.png" alt="Google" className="w-5 h-5 mr-2" />
              Inicia sesión con Google
            </button>
          </SignInButton>

          <p className="text-sm text-gray-600 ml-3">
            ¿No tienes una cuenta?{" "}
            <Link href="/auth/register" className="text-secondary font-bold hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>

      {/* Modal de Olvidaste tu contraseña */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-4/5 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recuperar contraseña</h3>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="forgot-email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="ejemplo@gmail.com"
                  required
                  className="w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              {forgotPasswordMessage && (
                <p className={`text-sm ${forgotPasswordMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {forgotPasswordMessage.text}
                </p>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                    setForgotPasswordMessage(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="flex-1 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-hover disabled:opacity-50"
                >
                  {forgotPasswordLoading ? "Enviando..." : "Enviar código"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
