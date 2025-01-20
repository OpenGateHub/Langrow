"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
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
      <div className="bg-white bg-opacity-70 shadow-lg rounded-3xl flex w-4/5 max-w-5xl overflow-hidden">

        {/* Left Section */}
        <div className="flex-1 bg-cover bg-center relative hidden lg:block pl-5">
          <div className="absolute inset-0"></div>
          <div className="absolute inset-0  flex flex-col justify-center items-start text-left text-black px-12">
            <Image src="/logo-primary.png" width={40} height={40} alt="logo" className="mb-2" ></Image>
            <h1 className="text-3xl font-bold mb-4">Bienvenido <br/> a Langrow</h1>
            <p className="text-lg">Comienza hoy mismo a alcanzar tus metas con clases personalizadas</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 p-8 sm:p-12 bg-gray">
          <h2 className="text-2xl font-semibold mb-6 text-center">Regístrate</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre/s</label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Pedro"
                  className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Sánchez"
                  className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+54"
                className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@gmail.com"
                className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Crea una contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                  className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirma tu contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="********"
                  className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-secondary hover:bg-primary-hover text-white font-bold py-2 rounded-md shadow-sm transition"
            >
              Registrate
            </button>
          </form>

          <div className="flex items-center justify-between mt-6">
            <button className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm hover:bg-gray-50 transition">
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
              Sign in with Google
            </button>
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <a href="/login" className="text-secondary font-bold hover:underline">
                Ingresa
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
