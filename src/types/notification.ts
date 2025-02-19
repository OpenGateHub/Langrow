interface Notification {
    id: number;
    profileId: number;
    isStaff: boolean;
    isActive: boolean;
    createAt: Date;
    updateAt: Date;
    message: string;
    url: string;
}