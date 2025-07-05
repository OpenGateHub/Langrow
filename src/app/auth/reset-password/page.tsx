"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useClerk, useSignIn } from "@clerk/nextjs";
import BlockUi from "@/app/components/BlockUi";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clerk = useClerk();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  
  // Estados para el proceso de recuperación
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [signInAttempt, setSignInAttempt] = useState<any>(null);
  const [clerkLoaded, setClerkLoaded] = useState(false);
  const [emailSentAutomatically, setEmailSentAutomatically] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    hasNumber: false,
    hasLetter: false,
    hasSpecialChar: false,
    matches: false
  });

  // Verificar si Clerk está cargado
  useEffect(() => {
    if (signInLoaded) {
      setClerkLoaded(true);
    }
  }, [signInLoaded]);

  // Verificar si hay parámetros en la URL
  useEffect(() => {
    if (!clerkLoaded) return;
    
    const emailParam = searchParams.get('email');
    const sentParam = searchParams.get('sent');
    
    if (emailParam && sentParam === 'true') {
      // Si viene con email y sent=true, significa que ya se envió desde el modal
      setEmail(emailParam);
      setStep('code');
      // Crear un signInAttempt vacío para que muestre el input de código
      setSignInAttempt({});
      setMessage({
        type: 'success',
        text: 'Código de verificación enviado. Revisa tu correo electrónico.'
      });
    } else if (emailParam) {
      // Si solo viene con email, mostrar el paso de email
      setEmail(emailParam);
      setEmailSentAutomatically(true);
    }
  }, [searchParams, clerkLoaded]);

  const handleCreateSignInAttempt = async (emailAddress: string) => {
    if (!clerkLoaded) return;
    
    try {
      const attempt = await signIn.create({
        identifier: emailAddress,
        strategy: "reset_password_email_code",
      });

      if (attempt.status === "needs_first_factor") {
        setSignInAttempt(attempt);
        setMessage({
          type: 'success',
          text: 'Código de verificación enviado. Revisa tu correo electrónico.'
        });
      }
    } catch (err: any) {
      console.error('Error al crear intento de signIn:', err);
      setMessage({
        type: 'error',
        text: err?.errors?.[0]?.message || "Error al enviar el código de verificación"
      });
      // Si hay error, volver al paso del email
      setStep('email');
    }
  };



  // Manejar countdown para reenvío de código
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [resendCountdown, resendDisabled]);

  // Validar contraseña en tiempo real
  const validatePassword = (password: string, confirmPassword: string) => {
    const validations = {
      length: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasLetter: /[a-zA-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      matches: password === confirmPassword && password.length > 0
    };
    setPasswordValidations(validations);
    return Object.values(validations).every(Boolean);
  };

  const handleSendResetEmailAutomatically = async (emailAddress: string) => {
    if (!clerkLoaded) {
      setMessage({
        type: 'error',
        text: "Sistema no disponible en este momento"
      });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      const attempt = await signIn.create({
        identifier: emailAddress,
        strategy: "reset_password_email_code",
      });

      if (attempt.status === "needs_first_factor") {
        setSignInAttempt(attempt);
        setStep('code');
        setMessage({
          type: 'success',
          text: 'Se ha enviado un código de verificación a tu correo electrónico.'
        });
        // Activar rate limiting después del envío exitoso
        setResendDisabled(true);
        setResendCountdown(60); // 60 segundos de espera
      }
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || "Error al enviar el código de verificación";
      
      if (errorMessage.includes("Too many requests")) {
        setMessage({
          type: 'error',
          text: 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.'
        });
        setResendDisabled(true);
        setResendCountdown(120); // 2 minutos de espera para rate limit
      } else {
        setMessage({
          type: 'error',
          text: errorMessage
        });
      }
      
      // Si hay error y no se envió automáticamente, volver al paso del email
      if (!emailSentAutomatically) {
        setStep('email');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerkLoaded) {
      setMessage({
        type: 'error',
        text: "Sistema no disponible en este momento"
      });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      const attempt = await signIn.create({
        identifier: email,
        strategy: "reset_password_email_code",
      });

      if (attempt.status === "needs_first_factor") {
        setSignInAttempt(attempt);
        setStep('code');
        setMessage({
          type: 'success',
          text: 'Se ha enviado un código de verificación a tu correo electrónico.'
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.errors?.[0]?.message || "Error al enviar el código de verificación"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerkLoaded) {
      setMessage({
        type: 'error',
        text: "Sistema no disponible en este momento"
      });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      let currentSignInAttempt = signInAttempt;
      
      // Si no hay signInAttempt o está vacío (viene del modal), crearlo
      if (!currentSignInAttempt || Object.keys(currentSignInAttempt).length === 0) {
        const newAttempt = await signIn.create({
          identifier: email,
          strategy: "reset_password_email_code",
        });
        
        if (newAttempt.status === "needs_first_factor") {
          currentSignInAttempt = newAttempt;
          setSignInAttempt(newAttempt);
        } else {
          throw new Error('Error al crear el intento de reset');
        }
      }

      const attempt = await currentSignInAttempt.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code,
      });

      if (attempt.status === "needs_new_password") {
        setSignInAttempt(attempt);
        setStep('password');
      } else if (attempt.status === "complete") {
        // Si el intento se completa directamente, redirigir
        setMessage({
          type: 'success',
          text: 'Código verificado exitosamente. Redirigiendo al login...'
        });
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: 'Error inesperado en la verificación del código'
        });
      }
    } catch (err: any) {
      console.error('Error al verificar código:', err);
      
      let errorMessage = "Código inválido";
      
      if (err?.errors && err.errors.length > 0) {
        const firstError = err.errors[0];
        if (firstError.message) {
          errorMessage = firstError.message;
        } else if (firstError.code) {
          switch (firstError.code) {
            case 'form_code_invalid':
              errorMessage = 'Código de verificación inválido';
              break;
            case 'form_code_expired':
              errorMessage = 'El código de verificación ha expirado';
              break;
            default:
              errorMessage = firstError.message || `Error: ${firstError.code}`;
          }
        }
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerkLoaded) {
      setMessage({
        type: 'error',
        text: "Sistema no disponible en este momento"
      });
      return;
    }
    
    if (!signInAttempt) {
      setMessage({
        type: 'error',
        text: "Error: No se encontró el intento de reset. Por favor intenta nuevamente."
      });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    // Validar contraseña
    const isPasswordValid = validatePassword(newPassword, confirmPassword);
    if (!isPasswordValid) {
      setMessage({
        type: 'error',
        text: 'Por favor, verifica que la contraseña cumpla con todos los requisitos'
      });
      setLoading(false);
      return;
    }

    try {
      // Usar la API correcta para reset de contraseña
      const attempt = await signInAttempt.attemptFirstFactor({
        strategy: "reset_password",
        password: newPassword,
      });

      if (attempt.status === "complete") {
        setMessage({
          type: 'success',
          text: 'Contraseña actualizada exitosamente. Redirigiendo al login...'
        });
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: 'Error inesperado en el proceso de actualización'
        });
      }
    } catch (err: any) {
      console.error('Error al actualizar contraseña:', err);
      
      let errorMessage = "Error al actualizar la contraseña";
      
      if (err?.errors && err.errors.length > 0) {
        const firstError = err.errors[0];
        if (firstError.message) {
          errorMessage = firstError.message;
        } else if (firstError.code) {
          // Manejar códigos de error específicos
          switch (firstError.code) {
            case 'form_identifier_not_found':
              errorMessage = 'No se encontró una cuenta con este correo electrónico';
              break;
            case 'form_password_pwned':
              errorMessage = 'Esta contraseña ha sido comprometida. Elige una contraseña más segura';
              break;
            case 'form_password_too_short':
              errorMessage = 'La contraseña es demasiado corta';
              break;
            case 'form_password_too_weak':
              errorMessage = 'La contraseña es demasiado débil';
              break;
            default:
              errorMessage = firstError.message || `Error: ${firstError.code}`;
          }
        }
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!clerkLoaded) {
      setMessage({
        type: 'error',
        text: "Sistema no disponible en este momento"
      });
      return;
    }
    
    if (resendDisabled) {
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      const attempt = await signIn.create({
        identifier: email,
        strategy: "reset_password_email_code",
      });

      if (attempt.status === "needs_first_factor") {
        setSignInAttempt(attempt);
        setMessage({
          type: 'success',
          text: 'Nuevo código enviado a tu correo electrónico.'
        });
        // Activar rate limiting
        setResendDisabled(true);
        setResendCountdown(60);
      }
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || "Error al reenviar el código";
      
      if (errorMessage.includes("Too many requests")) {
        setMessage({
          type: 'error',
          text: 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.'
        });
        setResendDisabled(true);
        setResendCountdown(120);
      } else {
        setMessage({
          type: 'error',
          text: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras Clerk se carga
  if (!clerkLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center relative">
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
          <div className="flex justify-center mb-6">
            <Image src="/logo-primary.png" width={40} height={40} alt="logo" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-6">Cargando...</h2>
            <p className="text-gray-600">Preparando el sistema de recuperación</p>
          </div>
        </div>
      </main>
    );
  }

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
          {step === 'email' && 'Recuperar contraseña'}
          {step === 'code' && 'Verificar código'}
          {step === 'password' && 'Nueva contraseña'}
        </h2>

        {/* Step indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            <div className={`w-3 h-3 rounded-full ${step === 'email' ? 'bg-secondary' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'code' ? 'bg-secondary' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'password' ? 'bg-secondary' : 'bg-gray-300'}`}></div>
          </div>
        </div>

        {/* Step 1: Email */}
        {step === 'email' && (
          <>
            {emailSentAutomatically ? (
              <div className="space-y-6">
                              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Para continuar con la recuperación de contraseña, haz clic en "Enviar código"
                </p>
                <p className="text-sm text-gray-500">
                  Se enviará un código de verificación a <strong>{email}</strong>
                </p>
              </div>
                
                {message && (
                  <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {message.text}
                  </p>
                )}
                
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSendResetEmailAutomatically(email)}
                    disabled={loading || resendDisabled}
                    className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-2 rounded-md shadow-sm transition disabled:opacity-50"
                  >
                    {loading ? "Enviando..." : 
                     resendDisabled ? `Espera ${resendCountdown}s` : "Enviar código"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setEmailSentAutomatically(false);
                      setEmail("");
                    }}
                    className="w-full border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition"
                  >
                    Usar otro email
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendResetEmail} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@gmail.com"
                    required
                    className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {message && (
                  <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {message.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-2 rounded-md shadow-sm transition disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar código"}
                </button>
              </form>
            )}
          </>
        )}

        {/* Step 2: Code */}
        {step === 'code' && (
          <>
            {!signInAttempt ? (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Para verificar el código, primero necesitamos enviarlo
                  </p>
                  <p className="text-sm text-gray-500">
                    Se enviará un código de verificación a <strong>{email}</strong>
                  </p>
                </div>
                
                {message && (
                  <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {message.text}
                  </p>
                )}
                
                <button
                  type="button"
                  onClick={() => handleCreateSignInAttempt(email)}
                  disabled={loading || resendDisabled}
                  className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-2 rounded-md shadow-sm transition disabled:opacity-50"
                >
                  {loading ? "Enviando..." : 
                   resendDisabled ? `Espera ${resendCountdown}s` : "Enviar código"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    required
                    maxLength={6}
                    className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500 text-center text-lg tracking-widest"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Ingresa el código de 6 dígitos enviado a {email}
                  </p>
                </div>

                {message && (
                  <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {message.text}
                  </p>
                )}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-2 rounded-md shadow-sm transition disabled:opacity-50"
                  >
                    {loading ? "Verificando..." : "Verificar código"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading || resendDisabled}
                    className="w-full text-secondary hover:text-secondary-hover text-sm underline disabled:opacity-50"
                  >
                    {resendDisabled ? `Reenviar código (${resendCountdown}s)` : "Reenviar código"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Step 3: New Password */}
        {step === 'password' && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nueva contraseña
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  validatePassword(e.target.value, confirmPassword);
                }}
                placeholder="********"
                required
                minLength={8}
                className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  validatePassword(newPassword, e.target.value);
                }}
                placeholder="********"
                required
                minLength={8}
                className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Validaciones de contraseña */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Requisitos de la contraseña:</p>
              <div className="space-y-1">
                <div className={`flex items-center text-xs ${passwordValidations.length ? 'text-green-600' : 'text-red-500'}`}>
                  <span className="mr-2">{passwordValidations.length ? '✓' : '✗'}</span>
                  Al menos 8 caracteres
                </div>
                <div className={`flex items-center text-xs ${passwordValidations.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                  <span className="mr-2">{passwordValidations.hasNumber ? '✓' : '✗'}</span>
                  Al menos un número
                </div>
                <div className={`flex items-center text-xs ${passwordValidations.hasLetter ? 'text-green-600' : 'text-red-500'}`}>
                  <span className="mr-2">{passwordValidations.hasLetter ? '✓' : '✗'}</span>
                  Al menos una letra
                </div>
                <div className={`flex items-center text-xs ${passwordValidations.hasSpecialChar ? 'text-green-600' : 'text-red-500'}`}>
                  <span className="mr-2">{passwordValidations.hasSpecialChar ? '✓' : '✗'}</span>
                  Al menos un carácter especial (!@#$%^&*)
                </div>
                <div className={`flex items-center text-xs ${passwordValidations.matches ? 'text-green-600' : 'text-red-500'}`}>
                  <span className="mr-2">{passwordValidations.matches ? '✓' : '✗'}</span>
                  Las contraseñas coinciden
                </div>
              </div>
            </div>

            {message && (
              <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !Object.values(passwordValidations).every(Boolean)}
              className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-2 rounded-md shadow-sm transition disabled:opacity-50"
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        )}

        {/* Back to login link */}
        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-secondary hover:text-secondary-hover text-sm underline">
            Volver al login
          </Link>
        </div>
      </div>
    </main>
  );
} 