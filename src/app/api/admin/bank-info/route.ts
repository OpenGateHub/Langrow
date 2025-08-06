import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PROFILE_ROLE_STRING } from "@/app/config";
import { getProfileByUserId } from "../../profile/profile";
import {
  getBankInfoByProfileId,
  getAllActiveAccounts,
  getBankTokenByCode,
} from "../bank/bank";
import { z as zod } from "zod";
import { JwtService } from "@/lib/services/jwtService";
import { EncryptionService } from "@/lib/services/encryptionService";
import { logBankAction } from "@/lib/services/logService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // user clerk id
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { result: false, message: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const user = await currentUser();
    const userRole = user?.unsafeMetadata?.formRole ?? null;

    if (userRole === PROFILE_ROLE_STRING.ADMIN) {
      if (id) {
        const profile = await getProfileByUserId(id);
        if (!profile) {
          return NextResponse.json(
            {
              result: false,
              message: "Perfil no encontrado para el usuario proporcionado.",
            },
            { status: 404 }
          );
        }

        const data = await getBankInfoByProfileId(profile.id);
        return NextResponse.json(
          { result: true, message: "Consulta exitosa", data },
          { status: 200 }
        );
      } else {
        const data = await getAllActiveAccounts();
        return NextResponse.json(
          { result: true, message: "Consulta exitosa", data },
          { status: 200 }
        );
      }
    } else {
      const profile = await getProfileByUserId(userId);
      if (!profile) {
        return NextResponse.json(
          {
            result: false,
            message: "Perfil no encontrado para el usuario autenticado.",
          },
          { status: 404 }
        );
      }

      const data = await getBankInfoByProfileId(profile.id);
      if (!data) {
        return NextResponse.json(
          { result: false, message: "Información bancaria no encontrada." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { result: true, message: "Consulta exitosa", data },
        { status: 200 }
      );
    }
  } catch (err) {
    console.error("Error en el servidor:", err);
    return NextResponse.json(
      { result: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

const getPersonalInfoSchema = zod.object({
  bankCode: zod.string().min(1, "El código del banco es requerido"),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const userRole = user?.unsafeMetadata?.formRole ?? null;

    // ✅ Mejora 1: Unificación de verificación de autenticación y autorización
    if (!userId || userRole !== PROFILE_ROLE_STRING.ADMIN) {
      return NextResponse.json(
        {
          result: false,
          message: !userId
            ? "No autorizado. Debes iniciar sesión."
            : "No tienes permiso para realizar esta acción.",
        },
        { status: !userId ? 401 : 403 }
      );
    }

    const body = await req.json();
    const validation = getPersonalInfoSchema.safeParse(body);

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
    const tokenObj = await getBankTokenByCode(data.bankCode);

    if (!tokenObj || !tokenObj.tokenized) {
      return NextResponse.json(
        { result: false, message: "Token bancario no encontrado." },
        { status: 404 }
      );
    }

    const jwtService = new JwtService();
    const payload = jwtService.verify(tokenObj.tokenized);
    const { account_number, account_type, dni_type, dni_number, alias } =
      payload.data;

    const encryptionService = new EncryptionService();
    const response = {
      account_number: encryptionService.decrypt(account_number),
      account_type: encryptionService.decrypt(account_type),
      dni_type: encryptionService.decrypt(dni_type),
      dni_number: encryptionService.decrypt(dni_number),
      alias: encryptionService.decrypt(alias),
    };

    // ✅ Mejora 3: Agregar metadata útil al log
    await logBankAction({
      profile_id: tokenObj.profile_id as number,
      bank_code: data.bankCode,
      action: "VIEW",
      performed_by: userId,
      metadata: {
        role: userRole,
        source: "admin-panel",
      },
    });

    return NextResponse.json(
      { result: true, message: "Consulta exitosa", data: response },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error en el servidor:", err);
    return NextResponse.json(
      { result: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
