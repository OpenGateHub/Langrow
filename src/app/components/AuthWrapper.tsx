"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Cargando...</div>; // O tu spinner personalizado
  }

  return <>{children}</>;
}
