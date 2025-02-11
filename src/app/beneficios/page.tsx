"use client";
import React from "react";
import Head from "next/head";
import Image from "next/image";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";

interface Reward {
  id: number;
  type: "claseDiaria" | "comision" | "plus";
  title: string;
  description: string;
  medalImage: string;
  current?: number;
  target?: number;
}

// Mock de beneficios (estos datos se podrán obtener del back o pasar como props en el futuro)
const mockRewards: Reward[] = [
  {
    id: 1,
    type: "claseDiaria",
    title: "Clase diaria durante todo el año",
    description:
      "Si realizas una clase diaria durante todo el año, recibirás un viaje al finalizar el año. ¡Ya estás más cerca del viaje!",
    medalImage: "/medal-placeholder.png",
    current: 150, // Por ejemplo, 150 clases completadas
    target: 250,  // Supongamos que 250 es la cantidad de días hábiles del año
  },
  {
    id: 2,
    type: "comision",
    title: "Comisiones por traer un nuevo alumno",
    description:
      "Si traes un nuevo alumno, ganas las primeras cuotas de ese alumno.",
    medalImage: "/medal-placeholder.png",
    current: 7, // 7 alumnos nuevos
    // En este caso, no se muestra barra de progreso; se calcula la comisión (por ejemplo, 3 puntos por alumno)
  },
  {
    id: 3,
    type: "plus",
    title: "Bonificación adicional por cantidad de clases",
    description:
      "Al cumplir 10 clases a la semana, se otorga un plus adicional. ¡Vas 6 clases esta semana!",
    medalImage: "/medal-placeholder.png",
    current: 6,  // 6 clases esta semana
    target: 10,  // Meta semanal de 10 clases
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
                    {reward.type === "comision" ? (
                      <p className="text-sm text-gray-600 mt-2">
                        Trajiste {reward.current} alumnos nuevos, ganaste{" "}
                        {reward.current && reward.current * 3} puntos.
                      </p>
                    ) : (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-primary h-4 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                reward.current && reward.target
                                  ? (reward.current / reward.target) * 100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {reward.current} de {reward.target} completado (
                          {reward.current && reward.target
                            ? ((reward.current / reward.target) * 100).toFixed(0)
                            : 0}
                          %)
                        </p>
                      </>
                    )}
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
