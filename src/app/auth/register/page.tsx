"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SignInButton, useSignUp } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import { useProfile } from "@/hooks/useProfile";
import Link from "next/link";
import useRecaptcha from "@/hooks/useRecaptcha";
import BlockUi from "@/app/components/BlockUi";
import MessageModal from "@/app/components/Modal";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const clerk = useClerk();
  const { isLoaded, signUp } = useSignUp();
  const { createProfile } = useProfile();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const { captchaValue, captchaError, validateCaptcha, RecaptchaComponent } = useRecaptcha(siteKey);

  // Estados de los campos
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<string>("");

  // Estados para errores y si ya se intentó enviar
  const [clientErrors, setClientErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isVerificating, setIsVerificating] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [display, setDisplay] = useState(false);

  const displayMessage = (type: string, message: string) => {
    if (type === "error" || type === "success") {
      setMessage(message);
      setMessageType(type as "error" | "success");
      setDisplay(true);
    } else {
      console.error("Invalid message type:", type);
    }
  };

  // Función de validación para un campo dado
  const validateField = (fieldName: string, value: string) => {
    let error = "";
    switch (fieldName) {
      case "firstName":
        if (!value.trim()) {
          error = "¡Ups! Parece que olvidaste tu nombre. Por favor, ingresalo.";
        }
        break;
      case "lastName":
        if (!value.trim()) {
          error = "¡No te olvides de tu apellido! Ingrésalo, por favor.";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = "El correo electrónico ingresado no parece correcto. ¿Podrías revisarlo?";
        }
        break;
      case "password":
        if (value.length < 8) {
          error = "Tu contraseña debe tener al menos 8 caracteres para ser segura.";
        }
        if (!/[A-Z]/.test(value)) {
          error += (error ? " " : "") + "Incluí al menos una letra mayúscula, por favor.";
        }
        if (!/[0-9]/.test(value)) {
          error += (error ? " " : "") + "No olvides incluir al menos un número.";
        }
        break;
      case "confirmPassword":
        if (value !== password) {
          error = "Las contraseñas no coinciden. ¡Verificalas, por favor!";
        }
        break;
      case "role":
        if (!value.trim()) {
          error = "Aún no elegiste tu rol. Por favor, selecciona una opción.";
        }
        break;
      default:
        break;
    }
    setClientErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  // onChange: si ya se intentó enviar, se valida en tiempo real
  const handleChange = (fieldName: string, value: string) => {
    switch (fieldName) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
      case "role":
        setRole(value);
        break;
      default:
        break;
    }
    if (hasSubmitted) {
      validateField(fieldName, value);
    }
  };

  useEffect(() => {
    if (clerk?.session) {
      router.push("/home");
    }
  }, [clerk?.session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setLoading(true);
    setMessage("");
    // Validamos todos los campos al enviar
    const errors: FormErrors = {};
    if (!firstName.trim()) {
      errors.firstName = "¡Ups! Parece que olvidaste tu nombre. Por favor, ingresalo.";
    }
    if (!lastName.trim()) {
      errors.lastName = "¡No te olvides de tu apellido! Ingrésalo, por favor.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "El correo electrónico ingresado no parece correcto. ¿Podrías revisarlo?";
    }
    if (password.length < 8) {
      errors.password = "Tu contraseña debe tener al menos 8 caracteres para ser segura.";
    }
    if (!/[A-Z]/.test(password)) {
      errors.password = (errors.password ? errors.password + " " : "") + "Incluí al menos una letra mayúscula, por favor.";
    }
    if (!/[0-9]/.test(password)) {
      errors.password = (errors.password ? errors.password + " " : "") + "No olvides incluir al menos un número.";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden. ¡Verificalas, por favor!";
    }
    if (!role.trim()) {
      errors.role = "Aún no elegiste tu rol. Por favor, selecciona una opción.";
    }
    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      setLoading(false);
      return;
    }

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
        unsafeMetadata: { formRole: role },
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
      if (!signUp) {
        throw new Error("signUp is not loaded");
      }
      const result = await signUp.attemptEmailAddressVerification({
        code: formData.get("verificationToken") as string,
      });
      if (result && result.status === "complete") {
        const userId = result.createdUserId;
        const dbRole = role === "org:alumno" ? 1 : role === "org:profesor" ? 2 : undefined;
        const newUserProfile = {
          code: userId,
          fullName: `${firstName} ${lastName}`,
          email: email,
          role: dbRole,
        };
        const response = await createProfile(newUserProfile);
        if (response && response.result) {
          setIsVerificating(false);
          window.location.replace("/home");
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
      <MessageModal
        isOpen={display}
        message={message}
        onClose={() => setDisplay(false)}
        type={messageType}
      />
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg-login.jpg"
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
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
            <form noValidate name="register-user" onSubmit={handleSubmit} className="space-y-4">
              {/* Inputs de Nombre y Apellido */}
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
                    value={firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                  {hasSubmitted && clientErrors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{clientErrors.firstName}</p>
                  )}
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
                    value={lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                  {hasSubmitted && clientErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{clientErrors.lastName}</p>
                  )}
                </div>
              </div>
              {/* Email */}
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
                  value={email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                />
                {hasSubmitted && clientErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{clientErrors.email}</p>
                )}
              </div>
              {/* Password */}
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
                  value={password}
                  onChange={(e) => {
                    handleChange("password", e.target.value);
                    if (confirmPassword) handleChange("confirmPassword", confirmPassword);
                  }}
                  className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                />
                {hasSubmitted && clientErrors.password && (
                  <p className="text-sm text-red-600 mt-1">{clientErrors.password}</p>
                )}
              </div>
              {/* Confirmar contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                />
                {hasSubmitted && clientErrors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{clientErrors.confirmPassword}</p>
                )}
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
                  value={role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Elige tu rol</option>
                  <option value="org:alumno">Quiero aprender inglés</option>
                  <option value="org:profesor">Quiero dar clases</option>
                </select>
                {hasSubmitted && clientErrors.role && (
                  <p className="text-sm text-red-600 mt-1">{clientErrors.role}</p>
                )}
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
            <form name="validate-user" onSubmit={handleEmailValidation} className="space-y-4">
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
