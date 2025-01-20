"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
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

      <div className="bg-white bg-opacity-70 shadow-lg rounded-3xl flex flex-col w-4/5 max-w-md overflow-hidden p-8 sm:p-12">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo-primary.png" width={40} height={40} alt="logo" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold mb-6 text-center">¡Bienvenido de vuelta!</h2>

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
          </div>

          <button
            type="submit"
            className="w-full bg-secondary hover:bg-primary-hover text-white font-bold py-2 rounded-md shadow-sm transition"
          >
            Inicia Sesión
          </button>
        </form>

        <div className="flex items-center justify-between mt-6">
          <button className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm hover:bg-gray-50 transition">
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
            Sign in with Google
          </button>
          <p className="text-sm text-gray-600 ml-3">
            ¿No tienes una cuenta? {" "}
            <a href="/register" className="text-secondary font-bold hover:underline">
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
