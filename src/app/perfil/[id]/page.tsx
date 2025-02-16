"use client";
import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import ProfilePage from "../../components/profile/ProfilePage";
import mockTutors from "../../data/mockTutors";

export default function TutorProfile() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const editMode = searchParams?.get("edit") === "true"; // Convert to boolean

    // Early return if the ID is invalid
    if (!params.id) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <h1 className="text-2xl font-bold text-gray-700">Tutor no encontrado.</h1>
            </div>
        );
    }

    return (
        <ProfilePage
            profileId={params.id}
            isTutor={true}
            editEnabled={editMode}
        />
    );
}