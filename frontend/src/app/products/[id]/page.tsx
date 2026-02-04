'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.id as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setIsLoading(true);
            const data = await productsApi.getOne(productId);
            setProduct(data);
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            // Improved: Redirect to signup as requested for non-account users
            window.location.href = '/signup';
            return;
        }

        try {
            setIsAdding(true);
            await addToCart(product!.id, quantity);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsAdding(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container py-12">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="skeleton aspect-square rounded-2xl" />
                    <div className="space-y-6">
                        <div className="skeleton h-4 w-24" />
                        <div className="skeleton h-10 w-3/4" />
                        <div className="skeleton h-8 w-32" />
                        <div className="skeleton h-32 w-full" />
                        <div className="skeleton h-12 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container py-24 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Product not found</h2>
                <p className="text-muted-foreground mt-4">The product you are looking for might have been removed or is unavailable.</p>
                <Link href="/" className="btn-clean btn-primary-clean mt-8 h-12 px-8">
                    Return to Marketplace
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-12 md:py-16 fade-in">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
                {/* Left: Product Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary border border-border">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    {!product.isInStock && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-red-600 text-white font-bold px-6 py-2 rounded-lg text-lg uppercase tracking-widest shadow-xl">Out of Stock</span>
                        </div>
                    )}
                </div>

                {/* Right: Interaction Area */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            {product.category && (
                                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] bg-accent/10 px-2 py-0.5 rounded">
                                    {product.category.name}
                                </span>
                            )}
                            {product.isInStock ? (
                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-[0.2em] bg-green-50 px-2 py-0.5 rounded">
                                    In Stock
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-[0.2em] bg-red-50 px-2 py-0.5 rounded">
                                    Sold Out
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
                            {product.name}
                        </h1>

                        <div className="mt-6 flex items-baseline gap-2">
                            <span className="text-4xl font-black text-foreground">
                                ₹{Number(product.price).toLocaleString('en-IN')}
                            </span>
                            <span className="text-sm text-muted-foreground font-medium">Incl. all taxes</span>
                        </div>
                    </div>

                    <div className="space-y-4 border-y border-border py-8">
                        <h3 className="text-sm font-bold text-foreground">Key Description</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            {product.description}
                        </p>
                    </div>

                    {/* Interaction */}
                    {product.isInStock ? (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-secondary/30 self-start">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-background hover:shadow-sm transition-all text-muted-foreground hover:text-foreground"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                        </svg>
                                    </button>
                                    <span className="w-12 text-center font-bold text-base">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                        disabled={quantity >= product.stockQuantity}
                                        className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-background hover:shadow-sm disabled:opacity-30 transition-all text-muted-foreground hover:text-foreground"
                                        title={quantity >= product.stockQuantity ? "Maximum stock reached" : ""}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAdding}
                                    className="btn-clean btn-primary-clean flex-1 h-12 text-base font-bold shadow-lg shadow-primary/10"
                                >
                                    {isAdding ? (
                                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    ) : (
                                        <>Add to Bag</>
                                    )}
                                </button>
                            </div>

                            {product.stockQuantity <= 5 && (
                                <p className="text-xs font-bold text-orange-600 flex items-center gap-1.5 animate-pulse">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Almost gone! Only {product.stockQuantity} items remaining.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-secondary/20 border border-border rounded-xl p-6 text-center border-dashed">
                            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-1">Currently Unavailable</p>
                            <p className="text-xs text-muted-foreground">We don't know when or if this item will be back in stock.</p>
                        </div>
                    )}

                    {/* Trust Block */}
                    <div className="p-4 bg-secondary/30 rounded-xl border border-border flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center text-green-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-xs font-bold text-foreground">Authenticity Checked & Quality Assured</p>
                    </div>
                </div>
            </div>

            {/* Modern Notification */}
            {showToast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-xs font-bold px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-4 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    Successfully added to bag
                </div>
            )}
        </div>
    );
}
