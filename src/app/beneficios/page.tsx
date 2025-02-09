"use client";
import React from "react";
import Head from "next/head";
import Image from "next/image";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";

interface Reward {
  id: number;
  title: string;
  description: string;
  progress: number; // Valor de 0 a 100
  medalImage: string;
}

// Mock de beneficios (estos datos se podrán obtener del back o pasar como props en el futuro)
const mockRewards: Reward[] = [
  {
    id: 1,
    title: "Clase diaria durante todo el año",
    description:
      "Si realizas una clase diaria durante todo el año, recibirás un viaje al finalizar el año.",
    progress: 80, // Ejemplo: 80% completado
    medalImage: "/medal-placeholder.png",
  },
  {
    id: 2,
    title: "Comisiones por traer un nuevo alumno",
    description:
      "Si traes un nuevo alumno, ganas las primeras cuotas de ese alumno.",
    progress: 50,
    medalImage: "/medal-placeholder.png",
  },
  {
    id: 3,
    title: "Bonificación adicional por cantidad de clases",
    description:
      "Al cumplir 10 clases a la semana, se otorga un plus adicional.",
    progress: 60,
    medalImage: "/medal-placeholder.png",
  },
];

const RewardsPage = () => {
  return (
    <>
      <Head>
        <title>Sistema de Recompensas | Langrow</title>
        <meta
          name="description"
          content="Descubre los beneficios y recompensas para profesores en Langrow."
        />
      </Head>
      <main className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <AnimateOnScroll>
            <h1 className="text-3xl md:text-4xl font-bold text-primary text-center mb-8">
              Sistema de Recompensas para Profesores
            </h1>
          </AnimateOnScroll>
          <div className="space-y-8">
            {mockRewards.map((reward, index) => (
              <AnimateOnScroll key={reward.id} delay={index * 100}>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center">
                  {/* Espacio para la "medalla" */}
                  <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                    <Image
                      src={reward.medalImage}
                      alt={`Medalla para ${reward.title}`}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-secondary mb-2">
                      {reward.title}
                    </h2>
                    <p className="text-gray-700 mb-4">{reward.description}</p>
                    {/* Barra de progreso */}
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-primary h-4 rounded-full transition-all duration-500"
                        style={{ width: `${reward.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {reward.progress}% completado
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default RewardsPage;
