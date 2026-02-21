import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private supabaseService: SupabaseService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1];

        if (!token) throw new UnauthorizedException('No token provided');

        const { data: { user }, error } = await this.supabaseService.getClient().auth.getUser(token);

        if (error || !user) throw new UnauthorizedException('Invalid token');

        // Attach user to request
        request.user = user;
        return true;
    }
}
