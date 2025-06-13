"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser, useClerk } from "@clerk/nextjs";
import { useProfile } from "@/hooks/useProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useProfileContext } from "@/context/ProfileContext";
import BlockUi from "@/app/components/BlockUi";
import MessageModal from "@/app/components/Modal";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const clerk = useClerk();
  const { createProfile } = useProfile();
  const { createNotification } = useNotifications();
  const { refetch: refetchProfile } = useProfileContext(); // Para refrescar el contexto

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [display, setDisplay] = useState(false);

  // Cargar datos del usuario de Google cuando el componente se monta
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || ""
      }));
    }
  }, [user]);

  useEffect(() => {
    // Si el usuario ya tiene un rol, redirigir al home
    if (user?.unsafeMetadata?.formRole) {
      router.push("/home");
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Crear perfil en nuestra base de datos con la misma estructura que usa el registro normal
      const newUserProfile = {
        code: user?.id || "",
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: user?.emailAddresses[0].emailAddress || "",
        role: formData.role,
        isStaff: false // Campo requerido por el schema
      };

      console.log("Enviando datos del perfil:", newUserProfile);
      const response = await createProfile(newUserProfile);
      console.log("Resultado de createProfile:", response);

      if (response && response.data && response.data.length > 0) {
        // Actualizar nombre, apellido y metadatos en Clerk
        try {
          await user?.update({
            firstName: formData.firstName,
            lastName: formData.lastName,
            unsafeMetadata: {
              ...user.unsafeMetadata,
              formRole: formData.role
            }
          });
          console.log("Datos actualizados en Clerk exitosamente");
        } catch (clerkError) {
          console.error("Error al actualizar datos en Clerk:", clerkError);
          throw new Error("Error al actualizar la información de usuario");
        }

        // Refrescar el ProfileContext para que detecte el nuevo perfil
        if (refetchProfile) {
          try {
            await refetchProfile();
            console.log("ProfileContext actualizado");
          } catch (refetchError) {
            console.log("Error al actualizar ProfileContext:", refetchError);
          }
        }

        // Obtener el ID del perfil creado y crear notificación de bienvenida (no bloqueante)
        const newProfile = response.data[0];
        const profileId = newProfile.id;

        if (profileId) {
          createNotification({
            profileId: profileId,
            message: "¡Bienvenido a Langrow! Tu perfil ha sido creado exitosamente. ¡Comienza a explorar!",
            isStaff: false,
            url: `/perfil/${user?.id}`
          }).then(() => {
            console.log("Notificación creada exitosamente");
          }).catch((notifError) => {
            console.log("Error al crear notificación (no crítico):", notifError);
          });
        }

        // Redirigir inmediatamente al home sin mostrar mensaje
        console.log("Redirigiendo al home...");
        router.push("/home");

      } else {
        throw new Error("No se pudo crear el perfil - respuesta inválida");
      }

    } catch (error) {
      console.error("Error completo:", error);
      
      // Mostrar error más específico
      let errorMessage = "Error al completar el perfil. Por favor, intenta nuevamente.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
      setMessageType("error");
      setDisplay(true);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex justify-center mb-6">
          <Image src="/logo-primary.png" width={40} height={40} alt="logo" />
        </div>

        <h2 className="text-2xl font-semibold mb-6 text-center">
          Completa tu perfil
        </h2>
        
        <p className="text-sm text-gray-600 mb-6 text-center">
          Hemos obtenido algunos datos de tu cuenta de Google. Solo necesitamos que selecciones tu rol.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Apellido
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="bg-[rgba(209,213,219,0.5)] mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
              placeholder="Tu apellido"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              ¿Qué quieres hacer?
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
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

        <p className="text-xs text-gray-500 mt-4 text-center">
          Al completar tu perfil, aceptas nuestros términos y condiciones.
        </p>
      </div>
    </main>
  );
} 