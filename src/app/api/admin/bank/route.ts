import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PROFILE_ROLE_STRING } from "@/app/config";
import { z as zod } from "zod";
import {
  getActiveBanks,
  createBankPersonalInfo,
  updateBankPersonalInfo,
  getBankInfoByCode,
} from "./bank";
import { getProfileByUserId } from "../../profile/profile";
import { BankPersonalInfoInput } from "./bank";

export async function GET(req: NextRequest) {
  try {
    const banks = await getActiveBanks();
    return NextResponse.json(
      {
        result: true,
        message: "Bancos activos obtenidos correctamente",
        data: banks,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al obtener los bancos activos:", error);
    return NextResponse.json(
      {
        result: false,
        message: "Error al obtener los bancos activos",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

const BankPersonalInfoInputSchema = zod.object({
  bank_id: zod.string().min(1, "El ID del banco es requerido"),
  bank_name: zod.string().min(1, "El nombre del banco es requerido"),
  account_number: zod.string().min(1, "El número de cuenta es requerido"),
  account_type: zod.string().min(1, "El tipo de cuenta es requerido"),
  dni_number: zod.string().min(1, "El número de DNI es requerido"),
  dni_type: zod.string().min(1, "El tipo de DNI es requerido"),
  alias: zod.string().min(1, "El alias es requerido"),
  isPrimary: zod.boolean(),
});

export type BankPersonalInfoInputRequest = zod.infer<
  typeof BankPersonalInfoInputSchema
>;

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json(
        { message: "Perfil no encontrado. Completa tu perfil primero." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = BankPersonalInfoInputSchema.safeParse(body);

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
    const payload: BankPersonalInfoInput = {
      ...data,
      bank_id: Number(data.bank_id),
      profile_id: profile.id,
    };
    const result = await createBankPersonalInfo(payload);

    return NextResponse.json(
      {
        result: true,
        message: "Información bancaria registrada exitosamente",
        data: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al crear la información bancaria:", error);
    return NextResponse.json(
      {
        result: false,
        message: "Error al crear la información bancaria",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export const BankUpdateRequestSchema = zod.object({
  bankCode: zod.string().min(1, "El código del banco es requerido"),
  bankData: zod.object({
    bank_name: zod.string().optional(),
    account_number: zod.string().optional(),
    account_type: zod.string().optional(),
    dni_number: zod.string().optional(),
    dni_type: zod.string().optional(),
    alias: zod.string().optional(),
    isPrimary: zod.boolean().optional(),
  }),
});

export type BankUpdateRequest = zod.infer<typeof BankUpdateRequestSchema>;

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    // Obtener información completa del usuario de Clerk
    const user = await currentUser();
    const userRole = user?.unsafeMetadata?.formRole ?? null;

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json(
        { message: "Perfil no encontrado. Completa tu perfil primero." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = BankUpdateRequestSchema.safeParse(body);

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

    const { bankCode, bankData } = validation.data;
    const bankInfo = await getBankInfoByCode(bankCode);
    if (!bankInfo) {
      return NextResponse.json(
        { result: false, message: "Cuenta bancaria no encontrada" },
        { status: 404 }
      );
    }
    const isOwner = profile.id === bankInfo.profile_id;

    if (userRole === PROFILE_ROLE_STRING.ADMIN || isOwner) {
      const result = await updateBankPersonalInfo(bankCode, bankData);
      if (!result) {
        return NextResponse.json(
          {
            result: false,
            message: "No se encontró la información bancaria para actualizar",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          result: true,
          message: "Información bancaria actualizada exitosamente",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          result: false,
          message: "No tienes permisos para actualizar la información bancaria",
        },
        { status: 403 }
      );
    }
  } catch (error: any) {
    console.error("Error al actualizar la información bancaria:", error);
    return NextResponse.json(
      {
        result: false,
        message: "Error interno al actualizar la información bancaria",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
