import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
const csv = require('csv-parser');
const AdmZip = require('adm-zip');
import { Readable } from 'stream';

@Injectable()
export class ProductsService {
    constructor(private supabaseService: SupabaseService) { }

    async processCSV(file: Express.Multer.File) {
        const results: any[] = [];
        const stream = Readable.from(file.buffer);

        return new Promise((resolve, reject) => {
            stream
                .pipe(csv())
                .on('data', (data: any) => results.push(data))
                .on('end', async () => {
                    try {
                        const { error } = await this.supabaseService.getClient()
                            .from('products')
                            .upsert(results);
                        if (error) throw error;
                        resolve(results);
                    } catch (e) {
                        reject(e);
                    }
                });
        });
    }

    async processZIP(file: Express.Multer.File) {
        const zip = new AdmZip(file.buffer);
        const zipEntries = zip.getEntries();

        for (const entry of zipEntries) {
            if (!entry.isDirectory) {
                const content = entry.getData();
                const fileName = entry.entryName;

                // Upload to Supabase Storage
                const { error } = await this.supabaseService.getClient()
                    .storage
                    .from('product-images')
                    .upload(fileName, content, {
                        upsert: true,
                        contentType: 'image/jpeg' // or determine from extension
                    });

                if (error) console.error(`Error uploading ${fileName}:`, error.message);
            }
        }
    }

    async findAll() {
        const { data, error } = await this.supabaseService.getClient()
            .from('products')
            .select('*, categories(name)');
        if (error) throw error;
        return data;
    }
}
