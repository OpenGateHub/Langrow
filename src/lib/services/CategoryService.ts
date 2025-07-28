import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_TABLES } from "@/app/config";


export class CategoryService {
    static async getCategoryByCode(code: string | null | undefined) {
        if (!code || code === undefined || code === null) {
            console.error('Category code is null or undefined');
            throw new Error('Category code is required');
        }
        try {
            const { data, error } = await supabaseClient
                .from(SUPABASE_TABLES.CATEGORIES)
                .select('*')
                .eq('code', code)
                .single();

            if (error) {
                console.error('Error fetching category:', error);
                throw new Error('Category not found');
            }

            return data;
        } catch (error) {
            console.error('Error in getCategoryByCode:', error);
            throw error;
        }
    }
}