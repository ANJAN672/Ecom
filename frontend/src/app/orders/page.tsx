'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import Link from 'next/link';

const statusColors: Record<string, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-primary',
    shipped: 'badge-primary',
    out_for_delivery: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-error',
};

const statusLabels: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

export default function OrdersPage() {
    const searchParams = useSearchParams();
    const newOrderNumber = searchParams.get('new');
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (newOrderNumber) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        }
    }, [newOrderNumber]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const data = await ordersApi.getAll();
            setOrders(data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        try {
            await ordersApi.cancel(orderId);
            fetchOrders();
        } catch (error: any) {
            alert(error.message || 'Failed to cancel order');
        }
    };

    if (authLoading) {
        return (
            <div className="container py-20 flex justify-center">
                <div className="spinner" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="container py-20 text-center">
                <h2 className="text-2xl font-bold">Please login to view your orders</h2>
                <Link href="/login" className="btn btn-primary mt-6">
                    Login
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-8 fade-in">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>

            {/* Success Message */}
            {showSuccess && (
                <div className="bg-success/10 border border-success/20 text-success px-6 py-4 rounded-lg mb-6 flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                        <p className="font-semibold">Order placed successfully!</p>
                        <p className="text-sm">Order Number: {newOrderNumber}</p>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-6">
                            <div className="skeleton h-6 w-1/4 mb-4" />
                            <div className="skeleton h-4 w-1/2 mb-2" />
                            <div className="skeleton h-20 w-full" />
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20">
                    <svg className="w-24 h-24 mx-auto text-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h2 className="text-2xl font-bold mt-6">No orders yet</h2>
                    <p className="text-muted mt-2">Start shopping to place your first order!</p>
                    <Link href="/" className="btn btn-primary mt-6">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="card overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-card-hover px-6 py-4 border-b border-border">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div>
                                            <p className="text-sm text-muted">Order Number</p>
                                            <p className="font-mono font-semibold">{order.orderNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted">Date</p>
                                            <p className="font-semibold">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted">Total</p>
                                            <p className="font-bold gradient-text">
                                                ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`badge ${statusColors[order.status]}`}>
                                            {statusLabels[order.status]}
                                        </span>
                                        {['pending', 'confirmed'].includes(order.status) && (
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="btn btn-secondary text-error text-sm py-2 px-4"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {order.orderItems.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-card-hover shrink-0">
                                                {item.productImage ? (
                                                    <img
                                                        src={item.productImage}
                                                        alt={item.productName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted">
                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold">{item.productName}</p>
                                                <p className="text-sm text-muted">
                                                    Qty: {item.quantity} × ₹{Number(item.priceAtPurchase).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <p className="font-semibold">
                                                ₹{Number(item.subtotal).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Delivery Address */}
                                <div className="mt-6 pt-6 border-t border-border">
                                    <p className="text-sm text-muted mb-2">Delivery Address</p>
                                    <p className="font-semibold">{order.shippingName}</p>
                                    <p className="text-sm text-muted">
                                        {order.shippingAddressLine1}
                                        {order.shippingAddressLine2 && `, ${order.shippingAddressLine2}`}
                                    </p>
                                    <p className="text-sm text-muted">
                                        {order.shippingCity}, {order.shippingState} - {order.shippingPinCode}
                                    </p>
                                    <p className="text-sm text-muted">Phone: {order.shippingPhone}</p>
                                </div>

                                {/* Payment Info */}
                                <div className="mt-4 flex items-center gap-4 text-sm">
                                    <span className="text-muted">
                                        Payment: <span className="font-semibold uppercase">{order.paymentMethod}</span>
                                    </span>
                                    <span className={`badge ${order.paymentStatus === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
