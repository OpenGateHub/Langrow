"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import BlockUi from "@/app/components/BlockUi";
import MessageModal from "@/app/components/Modal";
import { useConfigurationBanks } from "@/hooks/useConfigurationBanks";
import { useBankInfo } from "@/hooks/useBankInfo";
import { useProfileContext } from "@/context/ProfileContext";

export default function DatosCuentaPage() {
  const { user } = useUser();
  const router = useRouter();
  const { role } = useProfileContext();
  const configurationBanks = useConfigurationBanks()
  const bankInfo = useBankInfo()
  // Estados para la contraseña
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  });
  const [bankName, setBankName] = useState<string>("");
  const [bankId, setBankId] = useState<string>("");


  // Estados para información bancaria
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [accountHolder, setAccountHolder] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [bankCBU, setBankCBU] = useState("");
  const [bankAlias, setBankAlias] = useState("");
  const [bankError, setBankError] = useState("");
  const [bankSuccess, setBankSuccess] = useState("");
  const [hasBankInfo, setHasBankInfo] = useState(false); // Nueva estado para controlar si tiene info bancaria
  
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

  // Validación en tiempo real de la contraseña
  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    });
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
    if (hasPassword && !currentPassword) {
      setPasswordError("Debes ingresar tu contraseña actual");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : '',
          newPassword
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar la contraseña');
      }
      displayMessage("success", "Contraseña actualizada exitosamente");
      setIsEditingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleBankSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setBankError("");
    setBankSuccess("");
    
    // Validaciones básicas
    const currentAccountHolder = accountHolder || (user?.firstName + ' ' + user?.lastName) || '';
    
    if (!currentAccountHolder.trim()) {
      setBankError("El titular de la cuenta es requerido");
      setLoading(false);
      return;
    }
    
    if (!documentNumber.trim()) {
      setBankError("El DNI del titular es requerido");
      setLoading(false);
      return;
    }
    
    if (documentNumber.length !== 8) {
      setBankError("El DNI debe tener 8 dígitos");
      setLoading(false);
      return;
    }
    
    if (!/^\d+$/.test(documentNumber)) {
      setBankError("El DNI debe contener solo números");
      setLoading(false);
      return;
    }
    
    if (!bankCBU.trim()) {
      setBankError("El CBU es requerido");
      setLoading(false);
      return;
    }
    
    if (bankCBU.length !== 22) {
      setBankError("El CBU debe tener exactamente 22 dígitos");
      setLoading(false);
      return;
    }
    
    if (!/^\d+$/.test(bankCBU)) {
      setBankError("El CBU debe contener solo números");
      setLoading(false);
      return;
    }
    
    try {
      // Crear la información bancaria usando el método seguro
      const result = await bankInfo.createBankFromUserInput({
        bank_name: bankName,
        bank_id: bankId,
        account_number: bankCBU,
        account_type: "CA",
        dni_number: documentNumber,
        dni_type: "DNI",
        alias: bankAlias,
        isPrimary: true // Asignar como cuenta principal
      });

      if (result && result.result) {
        setBankSuccess("Información bancaria guardada exitosamente");
        setIsEditingBank(false);
        setHasBankInfo(true); // Marcar que ya tiene información bancaria
        
        // Refrescar los datos bancarios desde el servidor
        try {
          const updatedBankData = await bankInfo.getMaskedBankInfo();
          if (updatedBankData) {
            console.log("Datos bancarios actualizados:", updatedBankData);
            setAccountHolder(user?.firstName + ' ' + user?.lastName || "");
            setDocumentNumber(updatedBankData.dni_number || "");
            setBankCBU(updatedBankData.account_number || "");
            setBankAlias(updatedBankData.alias || "");
          }
        } catch (refreshError) {
          console.warn("Error al refrescar datos bancarios:", refreshError);
          // No mostramos error al usuario, solo un warning en consola
        }
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setBankSuccess("");
        }, 3000);
      } else {
        throw new Error(result?.message || "Error al crear la información bancaria");
      }
      
    } catch (err: any) {
      setBankError(err.message || "Error al guardar la información bancaria");
    } finally {
      setLoading(false);
    }
  };


  useEffect(()=> {
    bankInfo.getMaskedBankInfo().then((data) => {
      if (data) {
        console.log("Datos bancarios obtenidos:", data);
        setAccountHolder(user?.firstName + ' ' + user?.lastName || "");
        setDocumentNumber(data.dni_number || "");
        setBankCBU(data.account_number || "");
        setBankAlias(data.alias || "");
        setHasBankInfo(true); // Tiene información bancaria
      } else {
        // No tiene información bancaria, mostrar formulario por defecto
        setHasBankInfo(false);
        setIsEditingBank(true); // Mostrar formulario automáticamente
      }
    }).catch((error) => {
      console.error("Error al obtener información bancaria:", error);
      setHasBankInfo(false);
      setIsEditingBank(true); // Mostrar formulario en caso de error también
    });
  }, [])

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
              !isEditingPassword && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Contraseña</p>
                      <p className="text-gray-900">••••••••</p>
                    </div>
                    <button
                      onClick={() => setIsEditingPassword(true)}
                      className="text-secondary hover:text-secondary-hover text-sm font-medium"
                    >
                      Actualizar contraseña
                    </button>
                  </div>
                </div>
              )
            )}
            {/* Formulario de contraseña */}
            {isEditingPassword && (
              <div className="bg-gray-50 rounded-lg p-4">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {hasPassword && (
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
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        validatePassword(e.target.value);
                        // Actualizar validación de coincidencia
                        if (confirmPassword) {
                          setPasswordMatch(e.target.value === confirmPassword);
                        } else {
                          setPasswordMatch(null);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary"
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                    
                    {/* Validaciones de contraseña */}
                    {newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className={`text-xs flex items-center ${passwordValidation.length ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordValidation.length ? '✓' : '✗'} Al menos 8 caracteres
                        </div>
                        <div className={`text-xs flex items-center ${passwordValidation.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordValidation.uppercase ? '✓' : '✗'} Al menos una letra mayúscula
                        </div>
                        <div className={`text-xs flex items-center ${passwordValidation.number ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordValidation.number ? '✓' : '✗'} Al menos un número
                        </div>
                        <div className={`text-xs flex items-center ${passwordValidation.special ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordValidation.special ? '✓' : '✗'} Al menos un carácter especial
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar nueva contraseña
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        // Validación en tiempo real
                        if (e.target.value && newPassword) {
                          setPasswordMatch(e.target.value === newPassword);
                        } else {
                          setPasswordMatch(null);
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary ${
                        passwordMatch === null 
                          ? 'border-gray-300' 
                          : passwordMatch 
                            ? 'border-green-500' 
                            : 'border-red-500'
                      }`}
                      placeholder="Repite la contraseña"
                      required
                    />
                    {passwordMatch !== null && (
                      <p className={`text-sm mt-1 ${
                        passwordMatch ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {passwordMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                      </p>
                    )}
                  </div>
                  
                  {passwordError && (
                    <p className="text-sm text-red-600">{passwordError}</p>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-secondary text-white px-4 py-2 rounded-md text-sm hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    {loading ? "Guardando..." : "Actualizar contraseña"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPassword(false);
                      setNewPassword("");
                      setConfirmPassword("");
                      setCurrentPassword("");
                      setPasswordError("");
                      setPasswordMatch(null);
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Información bancaria - Solo visible para profesores */}
          {role === "org:profesor" && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Información bancaria</h2>
              
              {/* Si tiene datos bancarios y no está editando, mostrarlos */}
              {hasBankInfo && !isEditingBank ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Datos para recibir pagos</p>
                      <p className="text-sm text-gray-600">Tu información bancaria está configurada</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsEditingBank(true);
                        // Limpiar campos solo cuando es modo edición (no primera vez)
                        setDocumentNumber("");
                        setBankCBU("");
                        setBankAlias("");
                        setBankName("");
                        setBankId("");
                        setBankError("");
                        setBankSuccess("");
                      }}
                      className="text-secondary hover:text-secondary-hover text-sm font-medium"
                    >
                      Editar
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-md p-3 border">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Titular</p>
                        <p className="text-gray-900">{accountHolder}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">DNI</p>
                        <p className="text-gray-900">{documentNumber}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">CBU</p>
                        <p className="text-gray-900">{bankCBU}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Alias</p>
                        <p className="text-gray-900">{bankAlias || "No especificado"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mostrar formulario si no tiene datos o está editando */
                <div className="bg-gray-50 rounded-lg p-4">
                  {!hasBankInfo && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Configura tu información bancaria para recibir los pagos de tus clases</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleBankSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-700 mb-1">
                        Titular de la cuenta
                      </label>
                      <input
                        type="text"
                        id="accountHolder"
                        value={accountHolder || (user?.firstName + ' ' + user?.lastName) || ''}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary bg-gray-100"
                        placeholder="Juan Pérez"
                        required
                      />
                      <small className="text-gray-500">
                        Solo puedes registrar cuentas a tu nombre.
                      </small>
                    </div>
                    
                    <div>
                      <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        DNI del titular
                      </label>
                      <input
                        type="text"
                        id="documentNumber"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary"
                        placeholder="12345678"
                        maxLength={8}
                        required
                      />
                    </div>

                       <div>
                      <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Banco del titular
                      </label>
                      <select value={`${bankName}-${bankId}`} onChange={(e) => {
                        const [name, id] = e.target.value.split('-');
                        setBankName(name);
                        setBankId(id);
                      }}>
                        <option defaultValue={""} disabled selected>Selecciona un banco</option>
                        {
                          configurationBanks.banks.map((bank) => (
                            <option key={`${bank.name}-${bank.id}`} value={`${bank.name}-${bank.id}`}>
                              {bank.name}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="bankCBU" className="block text-sm font-medium text-gray-700 mb-1">
                        CBU (22 dígitos)
                      </label>
                      <input
                        type="text"
                        id="bankCBU"
                        value={bankCBU}
                        onChange={(e) => setBankCBU(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary"
                        placeholder="0000007900000000000000"
                        maxLength={22}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bankAlias" className="block text-sm font-medium text-gray-700 mb-1">
                        Alias (opcional)
                      </label>
                      <input
                        type="text"
                        id="bankAlias"
                        value={bankAlias}
                        onChange={(e) => setBankAlias(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary"
                        placeholder="juan.perez"
                      />
                    </div>
                    
                    {bankError && (
                      <p className="text-sm text-red-600">{bankError}</p>
                    )}
                    
                    {bankSuccess && (
                      <p className="text-sm text-green-600">{bankSuccess}</p>
                    )}
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-secondary text-white px-4 py-2 rounded-md text-sm hover:bg-primary-hover transition-colors disabled:opacity-50"
                      >
                        {loading ? "Guardando..." : "Guardar información bancaria"}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (hasBankInfo) {
                            setIsEditingBank(false);
                            try {
                              const originalBankData = await bankInfo.getMaskedBankInfo();
                              if (originalBankData) {
                                console.log("Datos bancarios restaurados:", originalBankData);
                                setAccountHolder(user?.firstName + ' ' + user?.lastName || "");
                                setDocumentNumber(originalBankData.dni_number || "");
                                setBankCBU(originalBankData.account_number || "");
                                setBankAlias(originalBankData.alias || "");
                              }
                            } catch (restoreError) {
                              console.warn("Error al restaurar datos bancarios:", restoreError);
                            }
                          }
                          setBankError("");
                          setBankSuccess("");
                        }}
                        className={`${
                          hasBankInfo 
                            ? "bg-gray-300 text-gray-700 hover:bg-gray-400" 
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        } px-4 py-2 rounded-md text-sm transition-colors`}
                        disabled={!hasBankInfo}
                      >
                        {hasBankInfo ? "Cancelar" : "Debe configurar sus datos bancarios"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Información de la cuenta */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Información de la cuenta</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Miembro desde: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 