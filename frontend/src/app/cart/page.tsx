'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

export default function CartPage() {
    const { cart, isLoading, updateQuantity, removeFromCart, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleQuantityChange = async (id: string, quantity: number) => {
        if (quantity < 1) return;
        setUpdatingId(id);
        try {
            await updateQuantity(id, quantity);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemove = async (id: string) => {
        setUpdatingId(id);
        try {
            await removeFromCart(id);
        } finally {
            setUpdatingId(null);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container py-24 text-center">
                <div className="max-w-md mx-auto card-minimal p-12">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Your cart is waiting</h2>
                    <p className="text-muted-foreground mt-2">Log in to view your items and continue shopping.</p>
                    <Link href="/login" className="btn-clean btn-primary-clean w-full mt-8">
                        Login to your account
                    </Link>
                    <Link href="/signup" className="block text-sm font-medium text-muted-foreground hover:text-foreground mt-4 transition-colors">
                        Don't have an account? Sign up
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="card-minimal p-6 flex gap-6">
                                <div className="skeleton w-24 h-24 rounded-lg" />
                                <div className="flex-1 space-y-3">
                                    <div className="skeleton h-6 w-1/2" />
                                    <div className="skeleton h-4 w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="skeleton h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container py-24 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-8 text-muted-foreground/30">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Your cart is empty</h2>
                    <p className="text-muted-foreground mt-4 text-lg">Looks like you haven't added anything to your cart yet.</p>
                    <Link href="/" className="btn-clean btn-primary-clean h-12 px-8 mt-10">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-12 md:py-16">
            <div className="flex items-end justify-between mb-10 border-b border-border pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight">Shopping Cart</h1>
                    <p className="text-sm text-muted-foreground">You have {cart.itemCount} items in your bag</p>
                </div>
                <button
                    onClick={() => clearCart()}
                    className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline underline-offset-4 transition-colors"
                >
                    Remove all items
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 items-start">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {cart.items.map((item) => (
                        <div
                            key={item.id}
                            className={`flex gap-6 pb-6 border-b border-border last:border-0 ${updatingId === item.id ? 'opacity-50' : ''} group`}
                        >
                            {/* Image */}
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-secondary shrink-0 border border-border">
                                {item.product.imageUrl ? (
                                    <img
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start gap-4">
                                        <Link href={`/products/${item.product.id}`} className="font-bold text-lg hover:text-accent transition-colors truncate">
                                            {item.product.name}
                                        </Link>
                                        <p className="font-bold text-lg shrink-0">
                                            ₹{Number(item.product.price).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    {item.product.category && (
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">{item.product.category}</p>
                                    )}
                                    {item.stockWarning && (
                                        <p className="text-[10px] font-bold text-orange-600 mt-2 bg-orange-50 dark:bg-orange-900/10 px-2 py-0.5 rounded-full inline-block">{item.stockWarning}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-secondary/30">
                                        <button
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1 || updatingId === item.id}
                                            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-background hover:shadow-sm disabled:opacity-30 transition-all text-muted-foreground hover:text-foreground"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                            </svg>
                                        </button>
                                        <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                            disabled={item.quantity >= item.product.stockQuantity || updatingId === item.id}
                                            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-background hover:shadow-sm disabled:opacity-30 transition-all text-muted-foreground hover:text-foreground"
                                            title={item.quantity >= item.product.stockQuantity ? "Limit reached" : ""}
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        disabled={updatingId === item.id}
                                        className="text-xs font-bold text-muted-foreground hover:text-red-600 transition-colors flex items-center gap-1.5"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="card-minimal p-8 sticky top-24 bg-secondary/10 border-none">
                        <h2 className="text-xl font-black tracking-tight mb-8">Order Summary</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Subtotal</span>
                                <span className="font-bold">₹{Number(cart.subtotal).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Estimated Shipping</span>
                                <span className="text-green-600 font-bold">Free</span>
                            </div>
                            <div className="h-px bg-border my-6" />
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total</p>
                                    <p className="text-4xl font-black tracking-tighter mt-1">₹{Number(cart.total).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>

                        <Link href="/checkout" className="btn-clean btn-primary-clean w-full h-12 text-base font-bold mt-10 shadow-lg shadow-primary/10">
                            Proceed to checkout
                        </Link>

                        <Link href="/" className="flex items-center justify-center gap-2 mt-6 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Continue shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
