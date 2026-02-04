'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { addressesApi, ordersApi } from '@/lib/api';
import { Address } from '@/types';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, isLoading: cartLoading, refreshCart } = useCart();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [notes, setNotes] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [error, setError] = useState('');
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAddresses();
        }
    }, [isAuthenticated]);

    const fetchAddresses = async () => {
        try {
            setIsLoadingAddresses(true);
            const data = await addressesApi.getAll();
            setAddresses(data || []);
            // Select default address
            const defaultAddr = data?.find((a: Address) => a.isDefault);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
            } else if (data?.length > 0) {
                setSelectedAddressId(data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            setError('Please select a delivery address');
            return;
        }

        setError('');
        setIsPlacingOrder(true);

        try {
            const order = await ordersApi.create({
                addressId: selectedAddressId,
                paymentMethod,
                notes: notes || undefined,
            });
            await refreshCart();
            router.push(`/orders?new=${order.orderNumber}`);
        } catch (err: any) {
            setError(err.message || 'Failed to place order');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (authLoading || cartLoading) {
        return (
            <div className="container py-20 flex justify-center">
                <div className="spinner" />
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container py-20 text-center fade-in">
                <svg className="w-24 h-24 mx-auto text-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 className="text-2xl font-bold mt-6">Your cart is empty</h2>
                <Link href="/" className="btn btn-primary mt-6">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-8 fade-in">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            {error && (
                <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Address & Payment */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Delivery Address */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Delivery Address</h2>
                            <Link href="/addresses" className="text-primary text-sm hover:underline">
                                Manage Addresses
                            </Link>
                        </div>

                        {isLoadingAddresses ? (
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <div key={i} className="skeleton h-24 rounded-lg" />
                                ))}
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted mb-4">No addresses saved</p>
                                <Link href="/addresses" className="btn btn-primary">
                                    Add Address
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {addresses.map((address) => (
                                    <label
                                        key={address.id}
                                        className={`block p-4 rounded-lg border cursor-pointer transition-all ${selectedAddressId === address.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-muted'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                name="address"
                                                checked={selectedAddressId === address.id}
                                                onChange={() => setSelectedAddressId(address.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{address.fullName}</span>
                                                    <span className="badge badge-primary text-xs uppercase">{address.type}</span>
                                                    {address.isDefault && (
                                                        <span className="badge badge-success text-xs">Default</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted mt-1">
                                                    {address.addressLine1}
                                                    {address.addressLine2 && `, ${address.addressLine2}`}
                                                </p>
                                                <p className="text-sm text-muted">
                                                    {address.city}, {address.state} - {address.pinCode}
                                                </p>
                                                <p className="text-sm text-muted">Phone: {address.phoneNumber}</p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="card p-6">
                        <h2 className="text-xl font-bold mb-4">Payment Method</h2>

                        <div className="space-y-3">
                            <label
                                className={`block p-4 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'cod'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-muted'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                    />
                                    <div className="flex-1">
                                        <span className="font-semibold">Cash on Delivery</span>
                                        <p className="text-sm text-muted">Pay when you receive your order</p>
                                    </div>
                                    <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </label>

                            {/* UPI - Coming Soon */}
                            <div className="block p-4 rounded-lg border border-border opacity-50 cursor-not-allowed">
                                <div className="flex items-center gap-3">
                                    <input type="radio" disabled />
                                    <div className="flex-1">
                                        <span className="font-semibold">UPI</span>
                                        <span className="badge badge-warning ml-2 text-xs">Coming Soon</span>
                                    </div>
                                </div>
                            </div>

                            {/* Credit Card - Coming Soon */}
                            <div className="block p-4 rounded-lg border border-border opacity-50 cursor-not-allowed">
                                <div className="flex items-center gap-3">
                                    <input type="radio" disabled />
                                    <div className="flex-1">
                                        <span className="font-semibold">Credit/Debit Card</span>
                                        <span className="badge badge-warning ml-2 text-xs">Coming Soon</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Notes */}
                    <div className="card p-6">
                        <h2 className="text-xl font-bold mb-4">Order Notes (Optional)</h2>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any special instructions for delivery..."
                            className="input min-h-[100px] resize-none"
                        />
                    </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <div className="card p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                        {/* Items */}
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex gap-3">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-card-hover shrink-0">
                                        {item.product.imageUrl ? (
                                            <img
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.product.name}</p>
                                        <p className="text-sm text-muted">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">₹{item.itemTotal.toLocaleString('en-IN')}</p>
                                </div>
                            ))}
                        </div>

                        <hr className="my-6 border-border" />

                        {/* Totals */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-muted">
                                <span>Subtotal</span>
                                <span>₹{cart.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-muted">
                                <span>Shipping</span>
                                <span className="text-success">Free</span>
                            </div>
                            <hr className="border-border" />
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span className="gradient-text">₹{cart.total}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder || !selectedAddressId}
                            className="btn btn-primary w-full mt-6"
                        >
                            {isPlacingOrder ? (
                                <>
                                    <div className="spinner w-5 h-5 border-2" />
                                    Placing Order...
                                </>
                            ) : (
                                <>
                                    Place Order
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </>
                            )}
                        </button>

                        <p className="text-xs text-muted text-center mt-4">
                            By placing this order, you agree to our Terms of Service.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
