import { createClient } from '@supabase/supabase-js'
import { Database } from "@/types/database";

export const supabaseClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_SUPABASE_SERVICE_KEY as string,
);
