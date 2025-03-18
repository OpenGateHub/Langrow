
export interface Profile {
    id?: number;
    userId?: string;
    name?: string;
    createdAt?: string;
    updatedAt?: Date;
    isActive?: boolean;
    email?: string;
    role?: string | number;
    profileImg?: string;
    description?: string;
    reviews?: number;
    rating?: number;
    price?: number;
    location?: string;

};
