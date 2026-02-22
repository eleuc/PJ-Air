import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { PRODUCTS } from '../lib/products';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function syncProducts() {
    console.log('Syncing products...');
    try {
        const { data, error } = await supabase
            .from('products')
            .upsert(PRODUCTS, { onConflict: 'id' });

        if (error) throw error;
        console.log('Successfully synced products to Supabase.');
    } catch (err: any) {
        console.error('Error syncing products:', err.message);
        process.exit(1);
    }
}

syncProducts();
