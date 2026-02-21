import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private supabaseService: SupabaseService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) return false;

        // Fetch role from our profile table
        const { data: profile, error } = await this.supabaseService.getClient()
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !profile) throw new ForbiddenException('User profile not found');

        if (!roles.includes(profile.role)) {
            throw new ForbiddenException(`Access denied for role: ${profile.role}`);
        }

        return true;
    }
}
