import { ACCEPTED_PROVIDERS } from "@/app/config";
import { getUserIntegration } from "../utils/meet-provider";
import { GoogleMeetingProvider } from "./GoogleMeetingProvider";


export const getUserProvider = async (userId: number) => {
    const userInfo = await getUserIntegration(userId);
    if (!userInfo) {
        throw new Error(`No integration found for user ${userId}`);
    }
    switch (userInfo.provider) {
        case ACCEPTED_PROVIDERS.GOOGLE:
            return new GoogleMeetingProvider(userId);
        default:
            throw new Error(`Unsupported provider: ${userInfo.provider}`);  
    }
};
