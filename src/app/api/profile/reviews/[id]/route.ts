import {NextRequest, NextResponse} from 'next/server';
import {supabaseClient} from "@/app/api/supabaseClient";
import {PROFILE_ROLE} from "@/app/config";
import {getProfessorReviewsById, getStudentReviewsById} from "@/app/api/profile/reviews/reviews";
import {getStudentProfileById} from "@/app/api/profile/profile";

// Función para obtener reviews de profesores (UserReviews)
const getProfessorReviews = async (userId: string) => {
    const id = parseInt(userId, 10);
    const reviews = await getProfessorReviewsById(id);
    return reviews.map(review => ({
        id: review.review_id,
        userId: review.professor_id,
        studentId: review.reviewer_id,
        notes: review.notes,
        qualification: review.qualification,
        createdAt: review.review_date,
        isActive: review.is_active,
        StudentProfile: {
            id: review.reviewer_user_profile_id,
            fullName: review.reviewer_name,
            isActive: true,
            profileImg: review.reviewer_profile_img
        }
    }));
};


// Función para obtener reviews de estudiantes (Mentorship)
const getStudentReviews = async (studentIdStr: string) => {
    // Validación de studentId
    const studentId = parseInt(studentIdStr);
    if (isNaN(studentId)) {
        throw new Error("Invalid student ID");
    }

    // Obtener el perfil del estudiante
    const student = await getStudentProfileById(studentId);
    if (!student) {
        throw new Error(`Student profile not found for ID: ${studentId}`);
    }

    // Obtener las reseñas del estudiante
    const reviews = await getStudentReviewsById(student.student_code);
    if (!reviews || reviews.length === 0) {
        return [];
    }

    // Transformar los datos
    return reviews.map(review => ({
        id: review.id,
        userId: review.userId,
        studentId: review.studentId,
        notes: review.professorReview,
        qualification: review.professorRate,
        createdAt: review.reviewDate,
        isActive: true,
        ProfessorProfile: review.UserProfile
            ? {
                id: review.UserProfile.id,
                fullName: review.UserProfile.name,
                isActive: review.UserProfile.isActive ?? true, // Asegurar que `isActive` tenga un valor por defecto
                profileImg: review.UserProfile.profileImg,
            }
            : null // Manejar el caso en que `UserProfile` sea `null`
    }));
};


export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = await params;
    console.log(id);

    if (!id) {
        return NextResponse.json(
            { message: "Código de usuario requerido" },
            { status: 400 }
        );
    }

    try {
        // Obtener el rol del usuario
        const { data: userData, error: userError } = await supabaseClient
            .from("UserProfile")
            .select("role")
            .eq("id", parseInt(id))
            .single();

        if (userError || !userData) {
            return NextResponse.json(
                { message: "No se encontró el perfil de usuario", error: userError?.message },
                { status: 404 }
            );
        }
        let reviews;
        if (userData.role === PROFILE_ROLE["org:profesor"]) {
            reviews = await getProfessorReviews(id);
        } else if (userData.role === PROFILE_ROLE["org:alumno"]) {
            reviews = await getStudentReviews(id);
        } else {
            return NextResponse.json(
                { message: "Rol no soportado" },
                { status: 400 }
            );
        }
        if (!reviews || reviews.length === 0) {
            return NextResponse.json(
                { message: "No se encontraron reseñas para este usuario" },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { message: "Consulta exitosa", count: reviews.length, data: reviews },
            { status: 200 }
        );

    } catch (err) {
        console.error("Error en el servidor:", err);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}