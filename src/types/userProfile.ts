import { Profile } from "@/types/profile";
import { Achievement } from "./achievement";

// Interface for Professors
export interface UserProfile extends Profile {
    title?: string;
    description?: string;
    reviews?: number;
    price?: number;
    rating?: number;
    location?: string;
    profileImg?: string;
    isZoomEnabled?: boolean;
    achievements?: Achievement[];
}