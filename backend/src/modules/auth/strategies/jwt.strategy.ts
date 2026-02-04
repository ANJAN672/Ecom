import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT Strategy - Validates JWT tokens for protected routes
 * 
 * How it works:
 * 1. Extracts JWT from Authorization header (Bearer token)
 * 2. Verifies signature using secret key
 * 3. Checks expiration
 * 4. Returns payload if valid
 * 
 * Why Passport?
 * - Well-tested authentication middleware
 * - Supports multiple strategies (JWT, OAuth, Local, etc.)
 * - Easy to integrate with NestJS
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            // Extract token from: Authorization: Bearer <token>
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

            // Don't ignore expiration - expired tokens should be rejected
            ignoreExpiration: false,

            // Secret key for verifying token signature
            secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
        });
    }

    /**
     * Called after token is verified
     * Payload contains whatever we put in the token during login
     * 
     * @param payload - Decoded JWT payload
     * @returns User info to be attached to request.user
     */
    async validate(payload: any) {
        // payload.sub is the user ID (standard JWT claim)
        // payload.email is the user's email
        // payload.role is the user's role

        if (!payload.sub) {
            throw new UnauthorizedException('Invalid token');
        }

        // This object will be available as request.user
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}
