'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { cartApi } from '@/lib/api';
import { Cart } from '@/types';
import { useAuth } from './AuthContext';

interface CartContextType {
    cart: Cart | null;
    isLoading: boolean;
    itemCount: number;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
    removeFromCart: (cartItemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    const refreshCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart(null);
            return;
        }

        try {
            setIsLoading(true);
            const cartData = await cartApi.get();
            setCart(cartData);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch cart when authenticated
    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const addToCart = async (productId: string, quantity: number = 1) => {
        await cartApi.add(productId, quantity);
        await refreshCart();
    };

    const updateQuantity = async (cartItemId: string, quantity: number) => {
        await cartApi.updateQuantity(cartItemId, quantity);
        await refreshCart();
    };

    const removeFromCart = async (cartItemId: string) => {
        await cartApi.remove(cartItemId);
        await refreshCart();
    };

    const clearCart = async () => {
        await cartApi.clear();
        setCart(null);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                isLoading,
                itemCount: cart?.itemCount || 0,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                refreshCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
