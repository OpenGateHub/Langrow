"use client";

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { SignInButton } from "@clerk/nextjs";
import { useSignUp } from "@clerk/clerk-react";
import { useProfile } from "@/hooks/useProfile";
import Link from "next/link";
import useRecaptcha from "@/hooks/useRecaptcha";
import BlockUi from "@/app/components/BlockUi";
import MessageModal from "@/app/components/Modal";
import { Profile } from "@/types/profile";

export default function RegisterPage() {
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();
  const { createProfile } = useProfile();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const {
    captchaValue,
    captchaError,
    validateCaptcha,
    RecaptchaComponent,
  } = useRecaptcha(siteKey);

  const [loading, setLoading] = useState(false);
  const [isVerificating, setIsVerificating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string| null>('org:alumno');

  const [display, setDisplay] = useState(false);
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [message, setMessage] = useState("");

  const displayMessage = (type: string, message: string) => {
    if (type === "error" || type === "success") {
      setMessage(message);
      setMessageType(type);
      setDisplay(true);
    } else {
      console.error("Invalid message type:", type);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!validateCaptcha()) {
      setLoading(false);
      return;
    }

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const formRole = formData.get("role") as string;
    setEmail(email);
    setName(`${firstName} ${lastName}`);
    setRole(formRole);

    if (!isLoaded) {
      setLoading(false);
      return;
    }

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        unsafeMetadata: { role },
      });

      await signUp.prepareEmailAddressVerification();
      setIsVerificating(true);
    } catch (err) {
      console.error(err);
      displayMessage("error", "Hubo un error al registrarte. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    try {
      const result = await signUp?.attemptEmailAddressVerification({
        code: formData.get("verificationToken") as string
      });
      if (result && result.status === "complete") {
        // Obtén el ID del usuario
        const userId = result.createdUserId;

        const newUserProfile = {
          code: userId as string,
          fullName: name,
          email: email,
          role: role as string,
        };
        const response = await createProfile(newUserProfile);
        if (response && response.result) {
          setIsVerificating(false);
          router.push('/browse-tutor');
        }
      }
    } catch (e: any) {
      console.error(e);
      displayMessage("error", "Ha ocurrido un error al validar el token, intente nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative">
      <BlockUi isActive={loading} />
      <MessageModal isOpen={display}
          message={message}
          onClose={() => { setDisplay(false) }}
          type={messageType} />
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg-login.jpg"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="opacity-80"
        />
      </div>
      <div className="bg-white bg-opacity-70 shadow-lg rounded-3xl flex flex-col sm:flex-row w-full sm:w-4/5 max-w-5xl overflow-hidden mx-4 my-3">
        {/* Left Section */}
        <div className="flex-1 bg-cover bg-center relative hidden lg:block pl-5">
          <div className="absolute inset-0"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-start text-left text-black px-12">
            <Image
              src="/logo-primary.png"
              width={40}
              height={40}
              alt="logo"
              className="mb-2"
            />
            <h1 className="text-3xl font-bold mb-4">
              Bienvenido <br /> a Langrow
            </h1>
            <p className="text-lg">
              Comienza hoy mismo a alcanzar tus metas con clases personalizadas
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 p-8 sm:p-12 bg-gray">
          <h2 className="text-2xl font-bold mb-6 text-left">Regístrate</h2>
          {!isVerificating && (
            <form name={"register-user"} onSubmit={handleSubmit} className="space-y-4">
              {/* Inputs de Nombre y Apellido en columna en mobile y en fila en sm+ */}
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
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
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
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
                  name="password"
                  required
                  placeholder="********"
                  className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Selección de rol */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  ¿Qué quieres hacer?
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="org:alumno">Quiero aprender inglés</option>
                  <option value="org:profesor">Quiero dar clases</option>
                </select>
              </div>

              {/* CAPTCHA */}
              <div>
                {RecaptchaComponent()}
                {captchaError && (
                  <p className="text-sm text-red-600 mt-2">{captchaError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary hover:bg-primary-hover text-white font-bold py-2 rounded-md shadow-sm transition"
              >
                {loading ? "Registrando..." : "Regístrate"}
              </button>
            </form>
          )}
          {isVerificating && (
            <form name={"validate-user"} onSubmit={handleEmailValidation} className="space-y-4">
              <div className="flex flex-col">
                <div className="flex-1">
                  <label htmlFor="verificationToken" className="block text-sm font-medium text-gray-700">
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    id="verificationToken"
                    name="verificationToken"
                    required
                    placeholder="XXXXXX"
                    className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-secondary hover:bg-primary-hover text-white font-bold py-2 mt-2 rounded-md shadow-sm transition"
                  >
                    {loading ? "Verificando..." : "Verificar"}
                  </button>
                </div>
              </div>
            </form>
          )}
          {/* Google Login */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center justify-center">
              <SignInButton mode="modal">
                <button className="flex items-center bg-white border border-gray-300 rounded-md mt-3 px-4 py-2 shadow-sm hover:bg-gray-200 transition duration-200">
                  <img src="/google.png" alt="Google" className="w-5 h-5 mr-2" />
                  <span className="text-sm">Regístrate con Google</span>
                </button>
              </SignInButton>
            </div>

            <div className="text-center sm:mt-3">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/auth/login" className="text-secondary font-bold hover:underline">
                  Ingresa
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
