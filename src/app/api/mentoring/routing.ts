import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";
import { supabaseClient } from "@/app/api/supabaseClient";

export async function POST(req: NextRequest) {
    try {
        const mentoringSchema = zod.object({

        })
    } catch (e) {

    }
}