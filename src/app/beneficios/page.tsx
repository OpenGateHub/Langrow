"use client";
import React from "react";
import Head from "next/head";
import Image from "next/image";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";

interface Reward {
  id: number;
  type:
    | "abonoClase"
    | "adicionalSemanal"
    | "adicionalMensual"
    | "adicionalTrimestral"
    | "adicionalSemestral"
    | "adicionalAnual";
  title: string;
  description: string;
  current?: number;
  target?: number;
}

const getMotivationalMessage = (current: number, target: number) => {
  const progress = (current / target) * 100;
  if (progress >= 100) {
    return "Meta alcanzada. Buen trabajo!";
  } else if (progress >= 80) {
    return "Estás casi en la meta. ¡Sigue así!";
  } else if (progress >= 50) {
    return "Vas bien, sigue avanzando.";
  } else {
    return "Continúa esforzándote, cada paso cuenta.";
  }
};

const images = {
  abonoClase: "Abono por Clase",
  adicionalSemanal: "Adicional Semanal",
  adicionalMensual: "Adicional Mensual",
  adicionalTrimestral: "Adicional Trimestral",
  adicionalSemestral: "Adicional Semestral",
  adicionalAnual: "Adicional Anual",
};

const getMedalImage = (type: keyof typeof images, completed: boolean) => {
  const basePath = "/benefits/";
  const suffix = completed ? ".png" : " ByN.png";
  return `${basePath}${images[type]}${suffix}`;
};

const mockRewards: Reward[] = [
  {
    id: 1,
    type: "abonoClase",
    title: "Abono por Clase",
    description:
      "Recibe $7,200.00 por clase impartida (50% del valor hora del Combo 3). Cada clase suma en tu progreso.",
  },
  {
    id: 2,
    type: "adicionalSemanal",
    title: "Adicional Semanal",
    description:
      "Cumple 50 horas a la semana y obtén $7,272.00 adicionales (+1%). Mantén un ritmo constante cada semana.",
    current: 50,
    target: 50,
  },
  {
    id: 3,
    type: "adicionalMensual",
    title: "Adicional Mensual",
    description:
      "Al alcanzar 200 horas mensuales y mantener 50 horas semanales, recibirás $7,417.44 (+2%) adicionales. Un esfuerzo mensual que se nota.",
    current: 180,
    target: 200,
  },
  {
    id: 4,
    type: "adicionalTrimestral",
    title: "Adicional Trimestral",
    description:
      "Cumpliendo con 200 horas mensuales y 50 horas semanales, ganas $8,159.18 (+10%) cada trimestre. Un incentivo a corto plazo.",
    current: 2,
    target: 3,
  },
  {
    id: 5,
    type: "adicionalSemestral",
    title: "Adicional Semestral",
    description:
      "Si logras 200 horas mensuales y 50 horas semanales, recibirás $9,791.02 (+20%) cada semestre. Avanza mes a mes.",
    current: 4,
    target: 6,
  },
  {
    id: 6,
    type: "adicionalAnual",
    title: "Adicional Anual",
    description:
      "Al mantener 200 horas mensuales y 50 horas semanales durante el año, obtendrás $12,728.33 (+30%) adicionales. Un compromiso que se premia.",
    current: 10,
    target: 12,
  },
];

const RewardsPage = () => {
  return (
    <>
      <Head>
        <title>Sistema de Recompensas | Langrow</title>
        <meta
          name="description"
          content="Descubre los beneficios y recompensas para profesores en Langrow. ¡Tu esfuerzo se reconoce!"
        />
      </Head>
      <main className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <AnimateOnScroll>
            <h1 className="text-3xl md:text-4xl font-bold text-primary text-center mb-8">
              ¡Profe, sigue avanzando!
            </h1>
          </AnimateOnScroll>
          <div className="space-y-8">
            {mockRewards.map((reward, index) => {
              const hasProgress = reward.current !== undefined && reward.target !== undefined;
              const completed = hasProgress && reward.current! >= reward.target!;
              const progressPercentage = hasProgress ? (reward.current! / reward.target!) * 100 : 0;

              return (
                <AnimateOnScroll key={reward.id} delay={index * 100}>
                  <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                      <Image
                        src={getMedalImage(reward.type, completed)}
                        alt={`Medalla para ${reward.title}`}
                        width={80}
                        height={80}
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-secondary mb-2">{reward.title}</h2>
                      <p className="text-gray-700 mb-4">{reward.description}</p>
                      {hasProgress && (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-primary h-4 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {reward.current} de {reward.target} completado ({progressPercentage.toFixed(0)}%)
                          </p>
                          <p className="mt-2 text-sm font-medium text-amber-600">
                            {getMotivationalMessage(reward.current!, reward.target!)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
};

export default RewardsPage;
