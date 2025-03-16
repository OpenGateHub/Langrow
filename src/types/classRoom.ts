export interface ClassRoom {
    id: number;
    title: string;
    instructor: string;
    professorId: number;
    studentIds: number;
    category: string;
    date: Date;
    time: string;
    duration: string;
    cost: string;
    status: StudentStatus;
    studentRequest?: string;
}

export enum StudentStatus {
    REQUESTED = 'requested',
    NEXT = 'next',
    NOTCONFIRMED = 'not-confirmed',
    CONFIRMED = 'confirmed',
}
