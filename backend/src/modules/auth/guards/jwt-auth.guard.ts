import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard - Protects routes that require authentication
 * 
 * Usage: @UseGuards(JwtAuthGuard) on controller or method
 * 
 * How it works:
 * 1. Intercepts incoming request
 * 2. Uses JwtStrategy to validate token
 * 3. If valid, request.user is populated
 * 4. If invalid, throws UnauthorizedException (401)
 * 
 * Why extend AuthGuard?
 * - AuthGuard('jwt') connects to our JwtStrategy
 * - We can customize behavior if needed (e.g., allow some routes)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    /**
     * Can be overridden to customize guard behavior
     * For example, allowing certain routes to bypass auth
     */
    canActivate(context: ExecutionContext) {
        // Call parent implementation
        return super.canActivate(context);
    }
}
