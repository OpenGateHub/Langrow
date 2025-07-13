"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useClerk, useSignIn, useSignUp, SignInButton, useUser } from "@clerk/nextjs";
import { useProfile } from "@/hooks/useProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useProfileContext } from "@/context/ProfileContext";
import useRecaptcha from "@/hooks/useRecaptcha";
import BlockUi from "@/app/components/BlockUi";
import MessageModal from "@/app/components/Modal";

// Estados de la página de autenticación
type AuthState = 'login' | 'register' | 'complete-profile' | 'email-verification' | 'reset-password-email' | 'reset-password-code' | 'reset-password-new';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

export default function AuthPage() {
  const router = useRouter();
  const clerk = useClerk();
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const { createProfile } = useProfile();
  const { createNotification } = useNotifications();
  const { refetch: refetchProfile } = useProfileContext();
  
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const { captchaValue, captchaError, validateCaptcha, RecaptchaComponent } = useRecaptcha(siteKey);

  // Estado actual de la página
  const [currentState, setCurrentState] = useState<AuthState>('login');
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ""
  });

  // Estados para reset password
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [signInAttempt, setSignInAttempt] = useState<any>(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [clientErrors, setClientErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [display, setDisplay] = useState(false);

  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (userLoaded && isSignedIn && user) {
      console.log("Usuario autenticado:", {
        firstName: user.firstName,
        lastName: user.lastName,
        publicMetadata: user.publicMetadata,
        unsafeMetadata: user.unsafeMetadata
      });
      
      // Solo redirigir a complete-profile si el usuario se registró con Google (tiene firstName/lastName pero no rol)
      const hasGoogleData = user.firstName && user.lastName;
      const hasRole = user?.publicMetadata?.role || user?.unsafeMetadata?.formRole;
      
      console.log("Verificación:", { hasGoogleData, hasRole });
      
      if (hasGoogleData && !hasRole) {
        console.log("Redirigiendo a complete-profile");
        setCurrentState('complete-profile');
        // Cargar datos del usuario de Google
        setFormData(prev => ({
          ...prev,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.emailAddresses[0]?.emailAddress || ""
        }));
      } else if (hasRole) {
        console.log("Redirigiendo a home");
        router.push("/home");
      } else {
        console.log("Usuario normal sin rol, se queda en login");
      }
    }
  }, [userLoaded, isSignedIn, user, router]);

  // Cargar datos del usuario cuando cambia a complete-profile
  useEffect(() => {
    if (currentState === 'complete-profile' && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddresses[0]?.emailAddress || ""
      }));
    }
  }, [currentState, user]);

  const displayMessage = (type: "error" | "success", message: string) => {
    setMessage(message);
    setMessageType(type);
    setDisplay(true);
  };

  // Validación de campos
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
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          error += (error ? " " : "") + "Incluí al menos un carácter especial (por ejemplo: !, @, #, $).";
        }
        if (!/[0-9]/.test(value)) {
          error += (error ? " " : "") + "No olvides incluir al menos un número.";
        }
        break;
      case "confirmPassword":
        if (value !== formData.password) {
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

  const handleChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    if (hasSubmitted) {
      validateField(fieldName, value);
    }
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    setMessage("");

    try {
      const result = await signIn.create({ 
        identifier: formData.email, 
        password: formData.password 
      });
      
      if (result.status === "complete") {
        await clerk.setActive({ session: result.createdSessionId });
        const user = clerk.user;
        console.log("Login completado:", {
          firstName: user?.firstName,
          lastName: user?.lastName,
          publicMetadata: user?.publicMetadata,
          unsafeMetadata: user?.unsafeMetadata
        });
        
        // Solo redirigir a complete-profile si tiene datos de Google pero no rol
        const hasGoogleData = user?.firstName && user?.lastName;
        const hasRole = user?.publicMetadata?.role || user?.unsafeMetadata?.formRole;
        
        console.log("Verificación login:", { hasGoogleData, hasRole });
        
        if (hasGoogleData && !hasRole) {
          console.log("Redirigiendo a complete-profile desde login");
          setCurrentState('complete-profile');
        } else if (hasRole) {
          console.log("Redirigiendo a home desde login");
          router.push("/home");
        } else {
          console.log("Usuario normal sin rol, se queda en login");
        }
      }
    } catch (err: any) {
      displayMessage("error", err?.errors?.[0]?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setHasSubmitted(true);
    setLoading(true);
    setMessage("");

    // Validación completa
    const errors: FormErrors = {};
    if (!formData.firstName.trim()) {
      errors.firstName = "¡Ups! Parece que olvidaste tu nombre. Por favor, ingresalo.";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "¡No te olvides de tu apellido! Ingrésalo, por favor.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "El correo electrónico ingresado no parece correcto. ¿Podrías revisarlo?";
    }
    if (formData.password.length < 8) {
      errors.password = "Tu contraseña debe tener al menos 8 caracteres para ser segura.";
    }
    if (!/[A-Z]/.test(formData.password)) {
      errors.password = (errors.password ? errors.password + " " : "") + "Incluí al menos una letra mayúscula, por favor.";
    }
    if (!/[0-9]/.test(formData.password)) {
      errors.password = (errors.password ? errors.password + " " : "") + "No olvides incluir al menos un número.";
    }
    if (!/[^A-Za-z0-9]/.test(formData.password)) {
      errors.password = (errors.password ? errors.password + " " : "") + "Incluí al menos un carácter especial (por ejemplo: !, @, #, $).";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden. ¡Verificalas, por favor!";
    }
    if (!formData.role.trim()) {
      errors.role = "Aún no elegiste tu rol. Por favor, selecciona una opción.";
    }

    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      setLoading(false);
      return;
    }

    try {
      // Crear el usuario
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        unsafeMetadata: { formRole: formData.role },
      });
      
      // Enviar automáticamente el código de verificación
      await signUp.prepareEmailAddressVerification();
      
      // Mostrar mensaje de éxito y cambiar a la pantalla de verificación
      displayMessage("success", "Código de verificación enviado a tu correo electrónico.");
      setCurrentState('email-verification');
    } catch (err: any) {
      const clerkError = err?.errors && err.errors.length > 0
        ? err.errors[0].message
        : "Hubo un error al registrarte. Por favor, intenta nuevamente.";
      displayMessage("error", clerkError);
    } finally {
      setLoading(false);
    }
  };

  // Email verification
  const handleEmailValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const formDataObj = new FormData(form);
    
    try {
      const result = await signUp!.attemptEmailAddressVerification({
        code: formDataObj.get("verificationToken") as string,
      });
      
      if (result && result.status === "complete") {
        const userId = result.createdUserId;
        const newUserProfile = {
          code: userId,
          fullName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          role: formData.role,
        };
        
        const response = await createProfile(newUserProfile);
        if (response && response.data && response.data.length > 0) {
          const newProfile = response.data[0];
          const profileId = newProfile.id;

          if (profileId) {
            createNotification({
              profileId: profileId,
              message: "¡Bienvenido a Langrow! Tu perfil ha sido creado exitosamente. ¡Comienza a explorar!",
              isStaff: false,
              url: `/perfil/${userId}`
            }).catch((notifError) => {
              console.log("Error al crear notificación (no crítico):", notifError);
            });
          }

          displayMessage("success", "¡Registro exitoso! Redirigiendo...");
          setTimeout(() => {
            router.push("/home");
          }, 2000);
        }
      }
    } catch (err: any) {
      displayMessage("error", "Código de verificación inválido. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Complete profile
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newUserProfile = {
        code: user?.id || "",
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: user?.emailAddresses[0].emailAddress || "",
        role: formData.role,
        isStaff: false
      };

      const response = await createProfile(newUserProfile);

      if (response && response.data && response.data.length > 0) {
        try {
          await user?.update({
            firstName: formData.firstName,
            lastName: formData.lastName,
            unsafeMetadata: {
              ...user.unsafeMetadata,
              formRole: formData.role
            }
          });
        } catch (clerkError) {
          console.error("Error al actualizar datos en Clerk:", clerkError);
          throw new Error("Error al actualizar la información de usuario");
        }

        if (refetchProfile) {
          try {
            await refetchProfile();
          } catch (refetchError) {
            console.log("Error al actualizar ProfileContext:", refetchError);
          }
        }

        const newProfile = response.data[0];
        const profileId = newProfile.id;

        if (profileId) {
          createNotification({
            profileId: profileId,
            message: "¡Bienvenido a Langrow! Tu perfil ha sido creado exitosamente. ¡Comienza a explorar!",
            isStaff: false,
            url: `/perfil/${user?.id}`
          }).catch((notifError) => {
            console.log("Error al crear notificación (no crítico):", notifError);
          });
        }

        displayMessage("success", "¡Perfil completado exitosamente! Redirigiendo...");
        setTimeout(() => {
          router.push("/home");
        }, 2000);
      } else {
        throw new Error("No se pudo crear el perfil - respuesta inválida");
      }
    } catch (error) {
      console.error("Error completo:", error);
      let errorMessage = "Error al completar el perfil. Por favor, intenta nuevamente.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      displayMessage("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset password - Send email
  const handleResetPasswordEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    setMessage("");

    try {
      const attempt = await signIn.create({
        identifier: resetEmail,
        strategy: "reset_password_email_code",
      });

      if (attempt.status === "needs_first_factor") {
        setSignInAttempt(attempt);
        setCurrentState('reset-password-code');
        displayMessage("success", "Código de verificación enviado. Revisa tu correo electrónico.");
        setResendDisabled(true);
        setResendCountdown(60);
      }
    } catch (err: any) {
      displayMessage("error", err?.errors?.[0]?.message || "Error al enviar el código de verificación");
    } finally {
      setLoading(false);
    }
  };

  // Reset password - Verify code
  const handleResetPasswordCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInAttempt) return;
    setLoading(true);
    setMessage("");

    try {
      const attempt = await signInAttempt.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
      });

      if (attempt.status === "needs_second_factor") {
        setCurrentState('reset-password-new');
        displayMessage("success", "Código verificado exitosamente.");
      }
    } catch (err: any) {
      displayMessage("error", "Código de verificación inválido. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Reset password - Set new password
  const handleResetPasswordNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInAttempt) return;
    setLoading(true);
    setMessage("");

    // Validar contraseña
    if (newPassword.length < 8) {
      displayMessage("error", "La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      displayMessage("error", "La contraseña debe incluir al menos una letra mayúscula.");
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      displayMessage("error", "La contraseña debe incluir al menos un número.");
      setLoading(false);
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      displayMessage("error", "La contraseña debe incluir al menos un carácter especial.");
      setLoading(false);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      displayMessage("error", "Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const attempt = await signInAttempt.resetPassword({
        password: newPassword,
      });

      if (attempt.status === "complete") {
        await clerk.setActive({ session: attempt.createdSessionId });
        displayMessage("success", "Contraseña actualizada exitosamente. Redirigiendo...");
        setTimeout(() => {
          router.push("/home");
        }, 2000);
      }
    } catch (err: any) {
      displayMessage("error", err?.errors?.[0]?.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  // Resend reset code
  const handleResendResetCode = async () => {
    if (!signIn || resendDisabled) return;
    setLoading(true);
    setMessage("");

    try {
      const attempt = await signIn.create({
        identifier: resetEmail,
        strategy: "reset_password_email_code",
      });

      if (attempt.status === "needs_first_factor") {
        setSignInAttempt(attempt);
        displayMessage("success", "Nuevo código enviado a tu correo electrónico.");
        setResendDisabled(true);
        setResendCountdown(60);
      }
    } catch (err: any) {
      displayMessage("error", err?.errors?.[0]?.message || "Error al reenviar el código");
    } finally {
      setLoading(false);
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

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
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
          onChange={(e) => handleChange("password", e.target.value)}
          placeholder="********"
          className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
        />
        <div className="mt-1 text-right">
          <button
            type="button"
            onClick={() => setCurrentState('reset-password-email')}
            className="text-sm text-secondary hover:text-secondary-hover hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-secondary hover:bg-primary-hover text-white font-bold py-2 rounded-md shadow-sm transition"
      >
        Inicia Sesión
      </button>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Tu nombre"
          />
          {clientErrors.firstName && (
            <p className="text-sm text-red-500 mt-1">{clientErrors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Apellido
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Tu apellido"
          />
          {clientErrors.lastName && (
            <p className="text-sm text-red-500 mt-1">{clientErrors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="ejemplo@gmail.com"
        />
        {clientErrors.email && (
          <p className="text-sm text-red-500 mt-1">{clientErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="********"
        />
        {clientErrors.password && (
          <p className="text-sm text-red-500 mt-1">{clientErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirmar contraseña
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="********"
        />
        {clientErrors.confirmPassword && (
          <p className="text-sm text-red-500 mt-1">{clientErrors.confirmPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          ¿Qué quieres hacer?
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => handleChange("role", e.target.value)}
          className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">Elige tu rol</option>
          <option value="org:alumno">Quiero aprender inglés</option>
          <option value="org:profesor">Quiero dar clases</option>
        </select>
        {clientErrors.role && (
          <p className="text-sm text-red-500 mt-1">{clientErrors.role}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-secondary hover:bg-primary-hover text-white font-bold py-2 rounded-md shadow-sm transition"
      >
        Registrarse
      </button>
    </form>
  );

  const renderEmailVerificationForm = () => (
    <form onSubmit={handleEmailValidation} className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">¡Casi listo!</h3>
        <p className="text-sm text-gray-600 mb-2">
          Hemos enviado un código de verificación a:
        </p>
        <p className="text-sm font-medium text-gray-800 mb-6">
          {formData.email}
        </p>
        <p className="text-xs text-gray-500 mb-6">
          Revisa tu bandeja de entrada y spam. El código expira en 10 minutos.
        </p>
      </div>

      <div>
        <label htmlFor="verificationToken" className="block text-sm font-medium text-gray-700">
          Código de verificación
        </label>
        <input
          type="text"
          id="verificationToken"
          name="verificationToken"
          className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2 text-center text-lg tracking-widest"
          placeholder="000000"
          maxLength={6}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-secondary hover:bg-primary-hover text-white font-bold py-2 rounded-md shadow-sm transition"
        disabled={loading}
      >
        {loading ? "Verificando..." : "Verificar y completar registro"}
      </button>

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={() => setCurrentState('register')}
          className="text-sm text-secondary hover:text-secondary-hover hover:underline"
        >
          Cambiar email
        </button>
        <div>
          <button
            type="button"
            onClick={async () => {
              if (!signUp) return;
              setLoading(true);
              try {
                await signUp.prepareEmailAddressVerification();
                displayMessage("success", "Nuevo código enviado a tu correo electrónico.");
              } catch (err: any) {
                displayMessage("error", "Error al reenviar el código. Intenta nuevamente.");
              } finally {
                setLoading(false);
              }
            }}
            className="text-sm text-gray-600 hover:underline"
          >
            Reenviar código
          </button>
        </div>
      </div>
    </form>
  );

  const renderCompleteProfileForm = () => (
    <form onSubmit={handleCompleteProfile} className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          Hemos obtenido algunos datos de tu cuenta. Solo necesitamos que selecciones tu rol.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Apellido
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          ¿Qué quieres hacer?
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => handleChange("role", e.target.value)}
          className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
          required
        >
          <option value="">Elige tu rol</option>
          <option value="org:alumno">Quiero aprender inglés</option>
          <option value="org:profesor">Quiero dar clases</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-secondary hover:bg-primary-hover text-white font-bold py-2 rounded-md shadow-sm transition"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Completar perfil"}
      </button>
    </form>
  );

  const renderResetPasswordEmailForm = () => (
    <form onSubmit={handleResetPasswordEmail} className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">Recuperar contraseña</h3>
        <p className="text-sm text-gray-600">
          Ingresa tu correo electrónico y te enviaremos un código de verificación.
        </p>
      </div>

      <div>
        <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <input
          type="email"
          id="resetEmail"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="ejemplo@gmail.com"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-secondary hover:bg-primary-hover text-white font-bold py-2 rounded-md shadow-sm transition"
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar código"}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setCurrentState('login')}
          className="text-sm text-secondary hover:text-secondary-hover hover:underline"
        >
          Volver al login
        </button>
      </div>
    </form>
  );

  const renderResetPasswordCodeForm = () => (
    <form onSubmit={handleResetPasswordCode} className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">Verificar código</h3>
        <p className="text-sm text-gray-600">
          Hemos enviado un código de verificación a {resetEmail}
        </p>
      </div>

      <div>
        <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700">
          Código de verificación
        </label>
        <input
          type="text"
          id="resetCode"
          value={resetCode}
          onChange={(e) => setResetCode(e.target.value)}
          className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Ingresa el código de 6 dígitos"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-secondary hover:bg-primary-hover text-white font-bold py-2 rounded-md shadow-sm transition"
        disabled={loading}
      >
        {loading ? "Verificando..." : "Verificar código"}
      </button>

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={handleResendResetCode}
          disabled={resendDisabled}
          className="text-sm text-secondary hover:text-secondary-hover hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendDisabled ? `Reenviar en ${resendCountdown}s` : "Reenviar código"}
        </button>
        <div>
          <button
            type="button"
            onClick={() => setCurrentState('reset-password-email')}
            className="text-sm text-gray-600 hover:underline"
          >
            Cambiar email
          </button>
        </div>
      </div>
    </form>
  );

  const renderResetPasswordNewForm = () => (
    <form onSubmit={handleResetPasswordNew} className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">Nueva contraseña</h3>
        <p className="text-sm text-gray-600">
          Crea una nueva contraseña segura para tu cuenta.
        </p>
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
          Nueva contraseña
        </label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="********"
          required
        />
      </div>

      <div>
        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
          Confirmar nueva contraseña
        </label>
        <input
          type="password"
          id="confirmNewPassword"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="********"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-secondary hover:bg-primary-hover text-white font-bold py-2 rounded-md shadow-sm transition"
        disabled={loading}
      >
        {loading ? "Actualizando..." : "Actualizar contraseña"}
      </button>
    </form>
  );

  const renderForm = () => {
    switch (currentState) {
      case 'login':
        return renderLoginForm();
      case 'register':
        return renderRegisterForm();
      case 'email-verification':
        return renderEmailVerificationForm();
      case 'complete-profile':
        return renderCompleteProfileForm();
      case 'reset-password-email':
        return renderResetPasswordEmailForm();
      case 'reset-password-code':
        return renderResetPasswordCodeForm();
      case 'reset-password-new':
        return renderResetPasswordNewForm();
      default:
        return renderLoginForm();
    }
  };

  const renderFooter = () => {
    switch (currentState) {
      case 'login':
        return (
          <div className="flex items-center justify-between mt-6">
            <SignInButton mode="redirect">
              <button className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm hover:bg-gray-200 transition duration-200">
                <img src="/google.png" alt="Google" className="w-5 h-5 mr-2" />
                Inicia sesión con Google
              </button>
            </SignInButton>

            <p className="text-sm text-gray-600 ml-3">
              ¿No tienes una cuenta?{" "}
              <button
                onClick={() => setCurrentState('register')}
                className="text-secondary font-bold hover:underline"
              >
                Regístrate
              </button>
            </p>
          </div>
        );
      case 'register':
        return (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <button
                onClick={() => setCurrentState('login')}
                className="text-secondary font-bold hover:underline"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        );
      case 'email-verification':
        return null;
      case 'complete-profile':
        return (
          <p className="text-xs text-gray-500 mt-4 text-center">
            Al completar tu perfil, aceptas nuestros términos y condiciones.
          </p>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (currentState) {
      case 'login':
        return '¡Bienvenido a Langrow!';
      case 'register':
        return 'Únete a Langrow';
      case 'email-verification':
        return 'Verifica tu correo';
      case 'complete-profile':
        return 'Completa tu perfil';
      case 'reset-password-email':
        return 'Recuperar contraseña';
      case 'reset-password-code':
        return 'Verificar código';
      case 'reset-password-new':
        return 'Nueva contraseña';
      default:
        return '¡Bienvenido a Langrow!';
    }
  };

  // Mostrar loading mientras Clerk se carga
  if (!userLoaded || !signInLoaded || !signUpLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center relative">
        <BlockUi isActive={true} />
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
            <h2 className="text-2xl font-semibold mb-4">Cargando...</h2>
            <p className="text-gray-600">Inicializando sistema de autenticación</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative">
      <BlockUi isActive={loading} />
      <MessageModal
        isOpen={display}
        onClose={() => setDisplay(false)}
        message={message}
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

      <div className="bg-white bg-opacity-70 shadow-lg rounded-3xl flex flex-col w-4/5 max-w-md overflow-hidden p-8 sm:p-12 my-4">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo-primary.png" width={40} height={40} alt="logo" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {getTitle()}
        </h2>

        {/* Form */}
        {renderForm()}

        {/* Footer */}
        {renderFooter()}
      </div>
    </main>
  );
} 