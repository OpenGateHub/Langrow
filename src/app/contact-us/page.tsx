"use client";
import Image from "next/image";
import Head from "next/head";
import useRecaptcha from "@/hooks/useRecaptcha";
import { useState } from "react";


export default function ContactPage() {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const {
    captchaValue,
    captchaError,
    validateCaptcha,
    RecaptchaComponent,
  } = useRecaptcha(siteKey);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateCaptcha()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, captcha: captchaValue }),
      });

      const result = await response.json();
      if (result.success) {
        setSuccessMessage("¡Correo enviado con éxito!");
        setFormData({ name: "", phone: "", email: "", message: "" }); 
      } else {
        setErrorMessage(result.message || "Hubo un error al enviar el correo");
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setErrorMessage("Hubo un error al enviar el correo.");
    } finally {
      setLoading(false);
    }
  };

    
  return (
    <>
      <Head>
        <title>Contacto | Langrow</title>
        <meta
          name="description"
          content="Contáctanos para aprender más sobre nuestras clases personalizadas. Estamos aquí para ayudarte a alcanzar tus objetivos."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="relative min-h-screen flex items-center justify-center bg-gray-100">

        <div className="absolute inset-0">
          <Image
            src="/bg-contact-us.jpg" 
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="opacity-80"
          />
        </div>

        <div className="bg-white/65 backdrop-blur-lg p-8 md:p-10 rounded-lg shadow-lg w-full max-w-lg my-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
            Contacta con Nosotros
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre/s
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Pedro"
                className="mt-1 block w-full rounded-md shadow-sm focus:border-primary sm:text-sm bg-gray-300 p-2 transition-colors duration-200 ease-in-out"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Teléfono
              </label>
              <input
                type="text"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+54"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-300 p-2"
              />
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
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ejemplo@gmail.com"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-300 p-2"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Mensaje
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Escribe tu mensaje"
                className="mt-1 block w-full bg-gray-300 p-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
              {/* CAPTCHA */}
              <div>
              {RecaptchaComponent()}
              {captchaError && (
                <p className="text-sm text-red-600 mt-2">{captchaError}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-[40%] flex justify-center bg-secondary hover:bg-primary-hover text-white font-semibold py-2 rounded-md transition duration-200"
              >
                Enviar
              </button>
              <div className="absolute bottom-4 right-4">
          <Image
            src="/logo-primary.png" 
            alt="Logo Langrow"
            width={50}
            height={30}
          />
        </div>
            </div>
          </form>
        </div>
       
      </main>
    </>
  );
}
