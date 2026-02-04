'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const { itemCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        setIsMenuOpen(false);
        router.push('/');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                {/* Left: Brand */}
                <div className="flex items-center gap-6 md:w-[200px]">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold leading-none">E</span>
                        </div>
                        <span className="font-bold text-lg tracking-tight hidden lg:inline-block">
                            EcomStore
                        </span>
                    </Link>
                </div>

                {/* Center: Search (Hidden on mobile, perfectly centered on desktop) */}
                <div className="hidden md:flex flex-1 items-center justify-center max-w-[500px] px-4">
                    <div className="relative w-full">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full bg-secondary text-sm border-none focus:ring-1 focus:ring-primary rounded-md pl-10 h-9 transition-all"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2 md:w-[200px]">
                    <Link
                        href="/cart"
                        className="inline-flex items-center justify-center rounded-md w-9 h-9 hover:bg-secondary transition-colors relative"
                        aria-label="Shopping Cart"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                {itemCount}
                            </span>
                        )}
                    </Link>

                    {isAuthenticated ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 pl-2 pr-1 h-9 rounded-md hover:bg-secondary transition-colors border border-transparent hover:border-border"
                            >
                                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase">
                                    {user?.firstName?.charAt(0)}
                                </div>
                                <svg className={`w-3 h-3 text-muted transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card p-1 shadow-lg fade-in animate-in slide-in-from-top-2 duration-200">
                                    <div className="px-3 py-2 text-sm">
                                        <p className="font-medium truncate">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                    <div className="h-px bg-border my-1" />

                                    <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors">
                                        My Orders
                                    </Link>
                                    <Link href="/addresses" onClick={() => setIsMenuOpen(false)} className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors">
                                        Manage Addresses
                                    </Link>

                                    <div className="h-px bg-border my-1" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-red-50 text-red-600 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 px-2">
                                Login
                            </Link>
                            <Link href="/signup" className="btn-clean btn-primary-clean !h-8 !px-3 !text-xs">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
