import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "../../supabaseClient";
import { z as zod } from "zod";
import { SUPABASE_TABLES } from "@/app/config";

const secretSchema = zod.object({
  token: zod.string(),
  refreshToken: zod.string(),
  expiresIn: zod.number(),
  scope: zod.string(),
});
const optionalValues = secretSchema.partial({
  expiresIn: true,
  scope: true,
});

type Secret = zod.infer<typeof optionalValues>;

const codeSchema = zod.object({
  code: zod.string(),
  userId: zod.number(),
});
type Code = zod.infer<typeof codeSchema>;

export async function POST(req: NextRequest) {
  try {
    const clientId = process.env.ZOOM_CLIENT_ID!;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET!;
    const redirectUri = process.env.ZOOM_REDIRECT_URI!;

    const reqBody: Code = await req.json();
    const body = codeSchema.safeParse(reqBody);
    if (!body.success) {
      return NextResponse.json(
        { message: "Error en la validación", error: body.error.errors },
        { status: 400 }
      );
    }

    const { code, userId } = body.data;

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const zoomBody = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const result = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: zoomBody.toString(),
    });

    const zoomResponse = await result.json();

    if (!result.ok) {
      return NextResponse.json(
        {
          result: false,
          message: "Error al obtener token de Zoom",
          data: zoomResponse,
          error: zoomResponse.error_description || "Respuesta no exitosa",
        },
        { status: result.status }
      );
    }

    const { access_token, refresh_token, expires_in, scope } = zoomResponse;

    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLES.PROFILES_SECRETS)
      .upsert({
        userId,
        token: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        scope,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        result: true,
        message: "Secreto de Zoom guardado correctamente",
        data,
        error: null,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        result: false,
        message: "Error al guardar el secreto de Zoom",
        data: null,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
