import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";
import { ClassRoomStatus } from "@/types/classRoom";
import { PreferenceMP } from "@/services/preferenceMp";

import {
  createMultipleClassRooms,
  getClassRoomByStudent,
  getClassRoomByProfessor,
  getClassRoomById,
  confirmClassRoom,
  cancelClassRoom,
  updateClassRoomStatus,
} from "../classRoom";
import {
  getStudentProfileByUserId,
  getProfileByUserId,
} from "../../profile/profile";

import { storePayment } from "../../payments/payments";
import { CategoryService } from "@/services/CategoryService";

const dev_enabled = true;

const CreatePaymentPreferenceSchema = zod.object({
  items: zod.array(
    zod.object({
      title: zod.string().min(1, "El título del producto es requerido"),
      unit_price: zod
        .number()
        .positive("El precio unitario debe ser un número positivo"),
      quantity: zod
        .number()
        .int()
        .positive("La cantidad debe ser un número entero positivo"),
    })
  ),
  external_reference: zod.string(),
  metadata: zod.object({
    alumnoId: zod.string(),
    profesorId: zod.string(),
    purchaseId: zod.string(),
    classDetails: zod
      .object({
        classType: zod.string().optional(),
        classTitle: zod.string().optional(),
        classSlots: zod
          .array(
            zod.object({
              date: zod.string().optional(),
              dayName: zod.string().optional(),
              timestamp: zod.string().optional(),
              time: zod.string().optional(),
              period: zod.string().optional(), // Puedes ajustar el tipo según tus necesidades
              duration: zod.string().optional(), // Puedes ajustar el tipo según tus necesidades
            })
          )
          .optional(), // Puedes ajustar el tipo según tus necesidades
      })
      .optional(),
  }),
});

type CreatePaymentPreferenceInput = zod.infer<
  typeof CreatePaymentPreferenceSchema
>;

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const validation = CreatePaymentPreferenceSchema.safeParse(reqBody);
    if (!validation.success) {
      return NextResponse.json(
        {
          result: false,
          message: "Error en la validación",
          error: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { data } = validation;
    const studentProfile = await getStudentProfileByUserId(
      data.metadata.alumnoId
    );
    const professorProfile = await getProfileByUserId(data.metadata.profesorId);
    if (!studentProfile || !professorProfile) {
      return NextResponse.json(
        {
          result: false,
          message:
            "Perfiles no ubicados, uno de los perfiles no existe en el sistema.",
        },
        { status: 404 }
      );
    }

    const preferenceMP = new PreferenceMP();

    const preference = await preferenceMP.create(data);

    if (!preference) {
      return NextResponse.json(
        { result: false, message: "Error al crear la preferencia de pago" },
        { status: 500 }
      );
    }

    const paymentTransaction = {
      payment_id: preference.id as string,
      external_reference: data.external_reference,
      payment_details: JSON.stringify(data),
      preference_id: preference.id,
      status: "pending",
      payment_type: "mercadoPago",
    };
    const result = await storePayment(paymentTransaction);

    const category = await CategoryService.getCategoryByCode(
      data.metadata.classDetails?.classType // Assuming the first item is the category code       
    )

    const classRoomData =
      data.metadata.classDetails?.classSlots?.map((slot) => ({
        studentId: studentProfile.id,
        professorId: professorProfile.id,
        category: category.id, // Assuming the first item is the category
        date: slot.date || "",
        time: slot.period || "",
        duration: slot.duration || "1 hour", // Default duration if not provided
        cost: data.items[0].unit_price.toString(), // Assuming the first item is the cost
        title: "Langrow - Clase de inglés",
        requestDescription: data.metadata.classDetails?.classTitle,
        status: ClassRoomStatus.CREATED,
        payment_id: result?.[0]?.id, // Use the stored payment ID or preference ID
      })) || [];

    // Insert the mentorings 
    await createMultipleClassRooms(classRoomData);

    return NextResponse.json(
      {
        result: true,
        message: "Preferencia de pago creada exitosamente",
        init_point: preference.init_point,
        id: preference.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en el endpoint de pago:", error);
    return NextResponse.json(
      { result: false, message: "Error interno del servidor", error },
      { status: 500 }
    );
  }
}
