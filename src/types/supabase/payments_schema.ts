
// Types basados en el objeto JSON
export type ClassSlot = {
    date: string;
    dayName: string;
    timestamp: string;
    time: string;
    period: string;
    duration: string;
}

export type ClassDetails = {
    classType: string;
    classTitle: string;
    classSlots: ClassSlot[];
}

export type PaymentMetadata = {
    alumnoId: string;
    profesorId: string;
    purchaseId: string;
    classDetails: ClassDetails;
}

export type PaymentStructure = {
    items: PaymentItem[];
    external_reference: string;
    metadata: PaymentMetadata;
}
export type Payment = {
    id: number;
    created_at: string;
    payment_id: string;
    payment_details: PaymentStructure;
    external_reference: string;
    prefrence_id: string;
    status: string;
    payemnt_type: string;
}