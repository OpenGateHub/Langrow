import { NextRequest, NextResponse } from "next/server";
import { getBankInfoByProfileId } from "@/app/api/admin/bank/bank";

// GET /api/admin/banks/[profileId]/main
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profileId = (await params).id;
    if (!profileId) {
      return NextResponse.json({ result: false, message: "profileId es requerido" }, { status: 400 });
    }
    const banks = await getBankInfoByProfileId(Number(profileId));
    if (!banks || banks.length === 0) {
      return NextResponse.json({ result: false, message: "No se encontró banco para ese profileId" }, { status: 404 });
    }
    // Buscar el banco principal (isPrimary === true)
    const mainBank = banks.find((b: any) => b.isPrimary === true);
    if (!mainBank) {
      return NextResponse.json({ result: false, message: "No hay banco principal para ese profileId" }, { status: 404 });
    }
    return NextResponse.json({ result: true, data: mainBank }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ result: false, message: "Error interno del servidor", error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 });
  }
}
