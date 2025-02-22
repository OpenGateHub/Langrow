export enum PROFILE_ROLE_STRING {
    PROFESOR = "org:profesor",
    ALUMNO = "org:alumno",
    ADMIN = "org:admin"
}

export enum PROFILE_ROLE {
    "org:profesor" = 1,
    "org:alumno" = 2,
    "org:admin" = 3
}

export const ROLE_MAP: Record<PROFILE_ROLE_STRING, PROFILE_ROLE> = {
    [PROFILE_ROLE_STRING.PROFESOR]: PROFILE_ROLE["org:profesor"],
    [PROFILE_ROLE_STRING.ALUMNO]: PROFILE_ROLE["org:alumno"],
    [PROFILE_ROLE_STRING.ADMIN]: PROFILE_ROLE["org:admin"],
};
