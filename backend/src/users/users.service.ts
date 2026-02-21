import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
    constructor(private supabaseService: SupabaseService) { }

    async findAll() {
        const { data, error } = await this.supabaseService.getClient()
            .from('users')
            .select('*');
        if (error) throw error;
        return data;
    }

    async findOne(id: string) {
        const { data, error } = await this.supabaseService.getClient()
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    }

    async create(userData: any) {
        const { data, error } = await this.supabaseService.getClient()
            .from('users')
            .insert([userData])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updateRole(id: string, role: string) {
        const { data, error } = await this.supabaseService.getClient()
            .from('users')
            .update({ role })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
}
