import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_TABLES, PROFILE_ROLE } from "@/app/config";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const profesorId = await params.id;
    if (!profesorId) {
      return NextResponse.json({ result: false, message: "ID de profesor requerido" }, { status: 400 });
    }

    // Buscar el perfil con ese userId y rol PROFESOR
    const { data: profiles, error } = await supabaseClient
      .from(SUPABASE_TABLES.PROFILES)
      .select("*")
      .eq("id", Number(profesorId))
      .eq("role", PROFILE_ROLE["org:profesor"])
      .limit(1);

    if (error) {
      return NextResponse.json({ result: false, message: "Error al consultar el perfil", error: error.message }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ result: false, message: "No se encontró un profesor con ese ID" }, { status: 404 });
    }

    return NextResponse.json({ result: true, data: profiles[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ result: false, message: "Error interno del servidor", error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 });           
  }
}
