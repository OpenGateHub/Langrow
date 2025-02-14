import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";
import { supabaseClient } from "@/app/api/supabaseClient";

export async function POST(req: NextRequest) {
    try {
        const reviewSchema = zod.object({
            rating: zod.number().min(0).max(5),
            student: zod.number(),
            professor: zod.number(),
            note: zod.string(),
        })
        const unvalidateBody = await req.json();

        const body = reviewSchema.safeParse(unvalidateBody);
        if (!body.success) {
            return NextResponse.json(
                { message: "Error en la validación", error: body.error.errors },
                { status: 400 }
            );
        }

        const userId = body.data.professor;
        const { data, error } = await supabaseClient
            .from('UserReviews')
            .insert([
                {
                    userId: userId,
                    studentId: body.data.student,
                    qualification: body.data.rating,
                    notes: body.data.note
                },
            ])
            .select();

        if (error) {
            console.error(error.message);
            return NextResponse.json(
                { message: 'Error al crear el registro...', error: error.message },
                { status: 500 }
            );
        }
        const res = await getAverageQualification(userId);

        await updateProfileReview(userId, res);

        return NextResponse.json(
            { message: "Calificacion agregada correctamente!", data },
            { status: 201 }
        );

    } catch (err) {
        console.error('Error en el servidor:', err);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const deletePayload = zod.object({ id: zod.number() });
        const unvalidateBody = await req.json();
        const body = deletePayload.safeParse(unvalidateBody);
        if (!body.success) {
            return NextResponse.json(
                { message: "Error en la validación", error: body.error.errors },
                { status: 400 }
            );
        }
        const { id } = body.data;
        const { data, error } = await supabaseClient
            .from('UserReviews')
            .update({'isActive': false, 'updatedAt': new Date()})
            .eq('id', id)
            .select();
        if (error) {
            console.error(error.message);
            return NextResponse.json(
                { message: 'Error al eliminar el registro...', error: error.message },
                { status: 500 }
            );
        }
        const userId = data[0].userId;
        const res = await getAverageQualification(userId);
        await updateProfileReview(userId, res)

        return NextResponse.json(
            { message: "Calificacion eliminada correctamente!", data },
            { status: 200 }
        );

    } catch (err) {
        console.error('Error en el servidor:', err);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}


async function getAverageQualification(id: number): Promise<{ totalReviews: number; avg: number }> {
    try {
        const { data, error } = await supabaseClient
            .from('UserReviews')
            .select('qualification')
            .eq('userId', id)
            .eq('isActive', true);

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            console.log('No hay calificaciones para este usuario.');
            return { avg: 0, totalReviews: 0 };
        }

        const qualifications = data
            .map(review => Number(review.qualification)) // Asegurar que sean números
            .filter(q => !isNaN(q)); // Eliminar posibles `null` o valores inválidos

        const averageQualification =
            qualifications.reduce((sum, q) => sum + q, 0) / qualifications.length;

        console.log('Promedio de la calificación:', averageQualification);
        return { avg: averageQualification, totalReviews: qualifications.length };
    } catch (error) {
        console.error('Error al obtener el promedio de la calificación:', error);
        return { avg: 0, totalReviews: 0 };
    }
}

async function updateProfileReview(id: number, data: { totalReviews: number; avg: number }) {
    try {
        const { data: result, error: err  } = await supabaseClient
            .from('UserProfile')
            .update({ 'rating': data.avg, 'reviews': data.totalReviews, 'updatedAt': new Date() })
            .eq('id', id);

        if (err) {
            console.error(err.message);
            return NextResponse.json(
                { message: 'Error al crear el registro...', error: err.message },
                { status: 500 }
            );
        }
    } catch (e) {
        throw e;
    }
}


