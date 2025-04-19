import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '../../supabaseClient';
import { z as zod } from 'zod';
import { SUPABASE_TABLES } from '@/app/config';

const secretSchema = zod.object({
    profileId: zod.number(),
    token: zod.string(),
    refreshToken: zod.string(),
    expiresIn: zod.number(),
});
const optionalValues = secretSchema.partial({
    expiresIn: true,
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

        const { profileId, token, refreshToken, expiresIn } = body.data;

        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.PROFILES_SECRETS)
            .upsert({
                profileId,
                token,
                refreshToken,
                expiresIn,
            });

        if (error) {
            throw error;
        }

        return NextResponse.json({ data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}