import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('auth')
export class AuthController {
    constructor(private supabaseService: SupabaseService) { }

    @Post('signup')
    async signup(@Body() body: any) {
        const { email, password, full_name, role } = body;

        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await this.supabaseService.getClient().auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;

        // 2. Create profile in our 'users' table
        if (authData.user) {
            const { error: profileError } = await this.supabaseService.getClient()
                .from('users')
                .insert({
                    id: authData.user.id,
                    email,
                    full_name,
                    role: role || 'Cliente'
                });

            if (profileError) throw profileError;
        }

        return { message: 'User registered successfully', user: authData.user };
    }

    @Post('login')
    async login(@Body() body: any) {
        const { email, password } = body;
        const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw new UnauthorizedException(error.message);

        return data;
    }
}
