import { Profile } from "@/types/profile";

export interface StudentProfile extends Profile {
    id: number;
    fullName: string;
    isActive: boolean;
    profileImg: string;
}