import { NextRequest } from "next/server";
import { calculateAchievement } from "./achievements";

export async function GET(req: NextRequest) {
    calculateAchievement("ad_week", 6)
        .then((result) => {
            console.log(result);
        }
        )
        .catch((error) => {
            console.error(error);
        }
        );
    return new Response("ok");
}
