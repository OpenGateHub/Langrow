"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BlockUi from "@/app/components/BlockUi";
import MessageModal from "@/app/components/Modal";

export default function DatosCuentaPage() {
  const { user } = useUser();
  const router = useRouter();
  
  // Estados para la contraseña
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [display, setDisplay] = useState(false);

  // Verificar si el usuario se registró con Google
  const hasGoogleData = user?.firstName && user?.lastName;
  const hasPassword = user?.passwordEnabled;
  const isGoogleUser = hasGoogleData && !hasPassword;

  const displayMessage = (type: "error" | "success", message: string) => {
    setMessage(message);
    setMessageType(type);
    setDisplay(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    
    // Validaciones
    if (newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("La contraseña debe incluir al menos una letra mayúscula");
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("La contraseña debe incluir al menos un número");
      setLoading(false);
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setPasswordError("La contraseña debe incluir al menos un carácter especial");
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    
    try {
      if (isGoogleUser) {
        // Usuario de Google: agregar contraseña por primera vez
        await user?.update({
          password: newPassword
        });
        displayMessage("success", "Contraseña agregada exitosamente");
      } else {
        // Usuario con contraseña: cambiar contraseña
        await user?.update({
          password: newPassword
        });
        displayMessage("success", "Contraseña actualizada exitosamente");
      }
      
      setIsEditingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || "Error al actualizar la contraseña";
      setPasswordError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <BlockUi isActive={true} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <BlockUi isActive={loading} />
      <MessageModal
        isOpen={display}
        onClose={() => setDisplay(false)}
        message={message}
        type={messageType}
      />

      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Datos de la cuenta</h1>
          </div>

          {/* Información del email */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Información de contacto</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{user.emailAddresses[0]?.emailAddress}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {user.emailAddresses[0]?.verification?.status === "verified" ? (
                    <span className="text-green-600">✓ Verificado</span>
                  ) : (
                    <span className="text-orange-600">⚠ Pendiente</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sección de contraseña */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Contraseña</h2>
            
            {isGoogleUser ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Cuenta de Google</p>
                    <p className="text-sm text-blue-700">Te registraste con Google. Puedes agregar una contraseña para iniciar sesión también con email y contraseña.</p>
                  </div>
                  {!isEditingPassword && (
                    <button
                      onClick={() => setIsEditingPassword(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                    >
                      Agregar contraseña
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Contraseña</p>
                    <p className="text-gray-900">••••••••</p>
                  </div>
                  {!isEditingPassword && (
                    <button
                      onClick={() => setIsEditingPassword(true)}
                      className="text-secondary hover:text-secondary-hover text-sm font-medium"
                    >
                      Cambiar contraseña
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Formulario de contraseña */}
            {isEditingPassword && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {!isGoogleUser && (
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña actual
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary"
                        placeholder="Ingresa tu contraseña actual"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      {isGoogleUser ? "Nueva contraseña" : "Nueva contraseña"}
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary"
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar contraseña
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary"
                      placeholder="Repite la contraseña"
                      required
                    />
                  </div>
                  
                  {passwordError && (
                    <p className="text-sm text-red-600">{passwordError}</p>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-secondary text-white px-4 py-2 rounded-md text-sm hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      {loading ? "Guardando..." : (isGoogleUser ? "Agregar contraseña" : "Cambiar contraseña")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPassword(false);
                        setNewPassword("");
                        setConfirmPassword("");
                        setCurrentPassword("");
                        setPasswordError("");
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Información de la cuenta</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• ID de usuario: {user.id}</p>
              <p>• Miembro desde: {new Date(user.createdAt).toLocaleDateString('es-ES')}</p>
              <p>• Método de registro: {isGoogleUser ? "Google" : "Email y contraseña"}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 