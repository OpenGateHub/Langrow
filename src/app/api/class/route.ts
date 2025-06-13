import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";
import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_TABLES } from "@/app/config";

// Esquema de validación para la creación de una clase
const createClassSchema = zod.object({
  alumnoId: zod.number().positive(),
  profesorId: zod.number().positive(),
  purchaseId: zod.string(),
  paymentId: zod.string(),
  status: zod.string(),
  meetingLink: zod.string().url(),
  meetingDate: zod.string().datetime()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Datos recibidos para crear clase:", body);
    
    // Validar los datos recibidos
    const validation = createClassSchema.safeParse(body);
    if (!validation.success) {
      console.error("Error en la validación:", validation.error.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: "Datos inválidos para crear la clase", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }
    
    // Extraer los datos validados
    const classData = validation.data;
    
    // Calcular la fecha de finalización (1 hora después)
    const startDate = new Date(classData.meetingDate);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1); // Clase de 1 hora por defecto
    
    // Crear la clase en la base de datos
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLES.MENTORSHIP)
      .insert({
        userId: classData.profesorId,
        studentId: classData.alumnoId,
        category: 1, // Categoría por defecto
        requestDescription: "Clase creada después de pago en MercadoPago",
        status: classData.status,
        title: "Clase de inglés",
        duration: 60, // 60 minutos por defecto
        beginsAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
        confirmed: true,
        classRoomUrl: classData.meetingLink,
        paymentId: classData.paymentId,
        purchaseId: classData.purchaseId
      })
      .select();
    
    if (error) {
      console.error("Error al crear la clase:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    console.log("Clase creada exitosamente:", data);
    
    return NextResponse.json(
      { success: true, data: data[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error en el servidor:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Obtener una clase por ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Se requiere un ID de clase" },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLES.MENTORSHIP_VIEW)
      .select()
      .eq("id", id)
      .single();
    
    if (error) {
      console.error("Error al obtener la clase:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: "Clase no encontrada" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error en el servidor:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
} 