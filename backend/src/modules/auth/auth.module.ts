import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

/**
 * AuthModule - Authentication module
 * 
 * Dependencies:
 * - PassportModule: Passport.js integration
 * - JwtModule: JWT token generation and verification
 * - UsersModule: Access to user data
 * 
 * JwtModule.registerAsync() configuration:
 * - Uses ConfigService to access environment variables after they're loaded
 * - secret: Key used to sign tokens (from environment)
 * - signOptions.expiresIn: Token expiration time
 */
@Module({
    imports: [
        UsersModule, // We need UsersService for auth
        PassportModule.register({ defaultStrategy: 'jwt' }),
        // Use registerAsync to ensure ConfigModule is loaded first
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'fallback-secret-change-me',
                signOptions: {
                    expiresIn: '7d',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtModule], // Export for use in other modules
})
export class AuthModule { }

