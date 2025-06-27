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
    status: ClassRoomStatus;
    studentRequest?: string;
}

export enum ClassRoomStatus {
    CREATED = 'created',
    REQUESTED = 'requested',
    NEXT = 'pending',
    NOTCONFIRMED = 'not-confirmed',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
}
