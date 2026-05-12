export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

export function initialize() {
    if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error('❌ CRITICAL ERROR: NEXT_PUBLIC_API_URL is missing. The frontend cannot start.');
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('⚠️ WARNING: Supabase keys are missing. Auth and image uploads may fail.');
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY) {
        console.warn('⚠️ WARNING: Google Maps Key is missing. Geo features will fail.');
    }
}
