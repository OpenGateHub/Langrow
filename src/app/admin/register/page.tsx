"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useRecaptcha from "@/hooks/useRecaptcha";

export default function AdminRegister() {
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const {
    captchaValue,
    captchaError,
    validateCaptcha,
    RecaptchaComponent,
  } = useRecaptcha(siteKey);

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!validateCaptcha()) {
      setErrorMessage("Por favor, completa la verificación del CAPTCHA.");
      setLoading(false);
      return;
    }

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const inviteCode = formData.get("inviteCode") as string;

    if (!isLoaded) {
      setLoading(false);
      return;
    }

    try {
      // Validar el código de invitación en el backend
      const response = await fetch("/api/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          inviteCode,
          captcha: captchaValue,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error en el registro");
      }

      alert("Registro exitoso. Por favor, verifica tu correo.");
      router.push("/admin/login");
    } catch (err) {
      console.error("Error durante el registro del administrador:", err);
      setErrorMessage((err as Error).message || "Hubo un error. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg-login.jpg"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="opacity-80"
        />
      </div>
      <div className="bg-white bg-opacity-70 shadow-lg rounded-3xl flex w-4/5 max-w-5xl overflow-hidden">
        <div className="flex-1 bg-cover bg-center relative hidden lg:block pl-5">
          <div className="absolute inset-0"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-start text-left text-black px-12">
            <Image
              src="/logo-primary.png"
              width={40}
              height={40}
              alt="logo"
              className="mb-2"
            ></Image>
            <h1 className="text-3xl font-bold mb-4">
              Bienvenido <br /> a Langrow
            </h1>
            <p className="text-lg">
              Únete como administrador y gestiona nuestra plataforma.
            </p>
          </div>
        </div>

        <div className="flex-1 p-8 sm:p-12 bg-gray">
          <h2 className="text-2xl font-semibold mb-6 text-left">
            Registro de Administradores
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre/s
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  placeholder="Pedro"
                  className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Apellido
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  placeholder="Sánchez"
                  className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="admin@langrow.com"
                className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="********"
                className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label
                htmlFor="inviteCode"
                className="block text-sm font-medium text-gray-700"
              >
                Código de invitación
              </label>
              <input
                type="text"
                id="inviteCode"
                name="inviteCode"
                required
                placeholder="Ingrese su código de invitación"
                className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              {/* Elemento oculto que Clerk espera para el CAPTCHA */}
              <div id="clerk-captcha" style={{ display: 'none' }}></div>
              {RecaptchaComponent()}
              {captchaError && (
                <p className="text-sm text-red-600 mt-2">{captchaError}</p>
              )}
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-primary-hover text-white font-bold py-2 rounded-md shadow-sm transition"
            >
              {loading ? "Registrando..." : "Registrarse como Administrador"}
            </button>
          </form>

          <div className="mt-6 text-left">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/auth/login"
                className="text-secondary font-bold hover:underline"
              >
                Ingresa
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
