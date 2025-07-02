export interface ClassRoom {
    id?: number| null;
    createdAt?: string| null;
    userId?: number| null;
    studentId?: number| null;
    beginsAt?: string| null;
    endsAt?: string| null;
    duration?: number| null;
    confirmed?: boolean| null;
    updatedAt?: string| null;
    professorRate?: number | null;
    professorReview?: string | null;
    reviewDate?: string | null;
    title?: string| null;
    category?: string | null | undefined;
    status?: string | null;
    requestDescription?: string| null;
    classRoomUrl?: string | null;
    meetingExternalId?: string | null;
    paymentId?: string| null;
}

export type ClassRoomUpdate = {
  id?: number;
  createdAt?: string;
  userId?: number | null;
  studentId?: number | null;
  beginsAt?: string | null;
  endsAt?: string | null;
  duration?: number | null;
  confirmed?: boolean | null;
  updatedAt?: string;
  professorRate?: number | null;
  professorReview?: string | null;
  reviewDate?: string | null;
  title?: string | null;
  requestDescription?: string | null;
  category?: number | null;
  status?: string | null;
  meetingExternalId?: string | null;
  classRoomUrl?: string | null;
  paymentId?: string | null;
};

export enum ClassRoomStatus {
    CREATED = 'created',
    REQUESTED = 'requested',
    NEXT = 'pending',
    NOTCONFIRMED = 'not-confirmed',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected',
}
