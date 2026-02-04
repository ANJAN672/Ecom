'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, usersApi } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            refreshUser().finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const refreshUser = async () => {
        try {
            const userData = await usersApi.getProfile();
            setUser(userData);
        } catch (error) {
            // Token invalid, clear it
            localStorage.removeItem('accessToken');
            setUser(null);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        localStorage.setItem('accessToken', response.accessToken);
        setUser(response.user);
    };

    const signup = async (data: { firstName: string; lastName: string; email: string; password: string }) => {
        const response = await authApi.signup(data);
        localStorage.setItem('accessToken', response.accessToken);
        setUser(response.user);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
