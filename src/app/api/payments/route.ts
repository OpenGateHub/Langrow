import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server';
import { z as zod } from "zod";
import { updatePaymentStatus, getPaymentByProfessorId } from "./payments";
import { updateClassRoomByPaymentId } from "../mentoring/classRoom";
import { ClassRoomStatus } from "@/types/classRoom";
import { NotificationService } from "@/services/notificationService";
import { getStudentProfileById, getProfileByUserId } from "../profile/profile";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const UpdatePaymentPreferenceSchema = zod.object({
      collection_id: zod.string(),
      collection_status: zod.string(),
      external_reference: zod.string(),
      payment_id: zod.string(),
      status: zod.string(),
      merchant_order_id: zod.string(),
      payment_type: zod.string(),
      preference_id: zod.string(),
      site_id: zod.string(),
      processing_mode: zod.string(),
      merchant_account_id: zod.string().optional(),
    });

    const validation = UpdatePaymentPreferenceSchema.safeParse(reqBody);
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
    const result = await updatePaymentStatus(
        data.preference_id,
        data.status
    );

    if (!result) {
      return NextResponse.json(
        { result: false, message: "Error al actualizar el estado del pago" },
        { status: 500 }
      );
    } else {
        console.log("Pago actualizado correctamente:");
        const updatedClassRoom = await updateClassRoomByPaymentId(
            String(result.id),
            (data.status === "approved") ? ClassRoomStatus.REQUESTED : ClassRoomStatus.CANCELLED
        );
        if (!updatedClassRoom) {
            return NextResponse.json(
                { result: false, message: "Error al actualizar la clase asociada al pago" },
                { status: 500 }
            );
        } else {
          const oneClassRoom = updatedClassRoom.data ? updatedClassRoom.data[0] : undefined; 
          const studentProfile = oneClassRoom ? await getStudentProfileById(oneClassRoom.studentId as number) : undefined;
          const proffesorId = oneClassRoom ? oneClassRoom.userId : undefined;
          if (studentProfile && proffesorId) {
            let message;
            let proffesorMessage;
            if (data.status === "approved") {
              message = `Tu clase con el profesor ha sido creada`;
              proffesorMessage = `Tenemos clases pendientes con el alumno ${studentProfile.name}.`;
            } else {
              message = `Tu clase con el profesor no ha sido creada.`;
              proffesorMessage = `Tu clase con el alumno no ha sido creada.`;
            }
            await NotificationService.create(
              studentProfile.id,
              message,
              `/mis-clases/`,
              false
            );
            await NotificationService.create(
              proffesorId,
              proffesorMessage,
              `/mis-clases/`,
              false
            );
          }
        }

        return NextResponse.json(
            { result: true, message: "Pago actualizado correctamente" },
            { status: 200 }
        );
    }


  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { result: false, message: "Error procesando el pago" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { result: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const profile = await getProfileByUserId(user.id);
    if (!profile) {
      return NextResponse.json(
        { result: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    const result = await getPaymentByProfessorId(profile.id, page, limit, from, to);

    if (!result || result.data.length === 0) {
      return NextResponse.json(
        { result: false, message: "No payments found for this professor" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: result.data,
        meta: result.meta,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { result: false, message: "Error fetching payments" },
      { status: 500 }
    );
  }
}
