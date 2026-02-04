'use client';

import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            window.location.href = '/signup';
            return;
        }

        try {
            setIsAdding(true);
            await addToCart(product.id);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="group relative">
            <Link href={`/products/${product.id}`} className="block">
                <div className={`card-minimal overflow-hidden transition-all duration-300 ${!product.isInStock ? 'grayscale opacity-70' : ''}`}>
                    {/* Image Wrapper - Aspect 1:1 */}
                    <div className="relative aspect-square bg-[#f5f5f7] overflow-hidden">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!product.isInStock ? 'blur-[2px]' : ''}`}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}

                        {/* Subtle Overlays */}
                        {!product.isInStock && (
                            <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="bg-zinc-900/90 text-[10px] font-black text-white px-3 py-1 rounded uppercase tracking-widest shadow-xl">Currently Unavailable</span>
                            </div>
                        )}

                        {product.category && (
                            <div className="absolute top-3 left-3">
                                <span className="bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                    {product.category.name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-1">
                        <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed h-[32px]">
                            {product.description}
                        </p>

                        <div className="pt-3 flex items-center justify-between">
                            <p className="text-base font-bold text-foreground">
                                ₹{Number(product.price).toLocaleString('en-IN')}
                            </p>

                            {product.isInStock ? (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAdding}
                                    className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
                                    title="Quick Add"
                                >
                                    {isAdding ? (
                                        <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    )}
                                </button>
                            ) : (
                                <span className="text-[10px] font-bold text-muted-foreground italic uppercase">Sold Out</span>
                            )}
                        </div>

                        {product.isInStock && product.stockQuantity <= 5 && (
                            <p className="text-[10px] text-orange-600 font-bold pt-1 animate-pulse">
                                Only {product.stockQuantity} remaining - Order soon!
                            </p>
                        )}
                    </div>
                </div>
            </Link>

            {/* Modern Notification */}
            {showToast && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 bg-black text-white text-[10px] px-3 py-1.5 rounded-full shadow-lg shadow-black/20 fade-in animate-in slide-in-from-bottom-2">
                    Added to cart
                </div>
            )}
        </div>
    );
}
