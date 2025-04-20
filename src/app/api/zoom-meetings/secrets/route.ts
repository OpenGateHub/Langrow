import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '../../supabaseClient';
import { z as zod } from 'zod';
import { SUPABASE_TABLES } from '@/app/config';

const secretSchema = zod.object({
    userId: zod.number(),
    token: zod.string(),
    refreshToken: zod.string(),
    expiresIn: zod.number(),
    scope: zod.string()
});
const optionalValues = secretSchema.partial({
    expiresIn: true,
    scope: true,
});

type Secret = zod.infer<typeof optionalValues>;


export async function POST(req: NextRequest) {
    try {
        const reqBody: Secret = await req.json();
        const body = optionalValues.safeParse(reqBody);
        if (!body.success) {
            return NextResponse.json(
                { message: "Error en la validación", error: body.error.errors },
                { status: 400 }
            );
        }

        const { userId, token, refreshToken, expiresIn, scope } = body.data;

        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.PROFILES_SECRETS)
            .upsert({
                userId,
                token,
                refreshToken,
                expiresIn,
                scope
            });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            result: true,
            message: "Secreto de Zoom guardado correctamente",
            data: data,
            error: null,
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({
            result: false,
            message: "Error al guardar el secreto de Zoom",
            data: null,
            error: error.message }, { status: 500 });
    }
}