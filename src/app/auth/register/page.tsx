"use client";

import React from "react";
import Image from "next/image";
import { SignInButton, useSignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  const { isLoaded, signUp } = useSignUp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification();
      alert("Revisa tu correo para confirmar tu cuenta.");
    } catch (err) {
      console.error("Error al registrarse:", err);
      alert("Hubo un error al registrarte. Por favor, intenta nuevamente.");
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
            ></Image>
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
          <h2 className="text-2xl font-semibold mb-6 text-center">Regístrate</h2>
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
                placeholder="ejemplo@gmail.com"
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

            <button
              type="submit"
              className="w-full bg-secondary hover:bg-primary-hover text-white font-bold py-2 rounded-md shadow-sm transition"
            >
              Regístrate
            </button>
          </form>

          {/* Google Login */}
          <div className="flex flex-row items-center ">
            <div className="flex items-center justify-between mt-6">
              <SignInButton mode="modal">
                <button className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm hover:bg-gray-50 transition">
                  <img
                    src="/google.png"
                    alt="Google"
                    className="w-5 h-5 mr-2"
                  /> <span className="text-sm">
                  Regístrate con Google
                  </span>
                </button>
              </SignInButton>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 ml-2 mt-1">
                ¿Ya tienes una cuenta?{" "}
                <a
                  href="/login"
                  className="text-secondary font-bold hover:underline"
                >
                  Ingresa
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
