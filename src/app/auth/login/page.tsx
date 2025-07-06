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
              <Link
                href="/auth/reset-password"
                className="text-sm text-secondary hover:text-secondary-hover hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
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


    </main>
  );
}
