import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Auth is handled at the frontend level via localStorage session.
        // This guard is a passthrough for now.
        return true;
    }
}
