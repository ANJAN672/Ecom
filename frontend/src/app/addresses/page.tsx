'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addressesApi } from '@/lib/api';
import { Address } from '@/types';
import Link from 'next/link';

export default function AddressesPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pinCode: '',
        landmark: '',
        type: 'home' as 'home' | 'work' | 'other',
        isDefault: false,
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAddresses();
        }
    }, [isAuthenticated]);

    const fetchAddresses = async () => {
        try {
            setIsLoading(true);
            const data = await addressesApi.getAll();
            setAddresses(data || []);
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await addressesApi.create(formData);
            setShowForm(false);
            setFormData({
                fullName: '',
                phoneNumber: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                pinCode: '',
                landmark: '',
                type: 'home',
                isDefault: false,
            });
            fetchAddresses();
        } catch (err: any) {
            setError(err.message || 'Failed to save address');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await addressesApi.setDefault(id);
            fetchAddresses();
        } catch (error: any) {
            alert(error.message || 'Failed to set default address');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            await addressesApi.delete(id);
            fetchAddresses();
        } catch (error: any) {
            alert(error.message || 'Failed to delete address');
        }
    };

    if (authLoading) {
        return (
            <div className="container py-20 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="container py-20 text-center">
                <div className="max-w-md mx-auto card-minimal p-12">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Manage your addresses</h2>
                    <p className="text-muted-foreground mt-4">Please login to view and manage your saved addresses.</p>
                    <Link href="/login" className="btn-clean btn-primary-clean w-full mt-8">
                        Login to continue
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-12 md:py-16 fade-in min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border pb-8">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-foreground">My Addresses</h1>
                    <p className="text-sm text-muted-foreground">Manage your shipping information for quick checkout</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-clean btn-primary-clean h-10 px-6 font-bold"
                    >
                        + Add New Address
                    </button>
                )}
            </div>

            {/* Add Address Form - Neat UI */}
            {showForm && (
                <div className="max-w-3xl mx-auto card-minimal p-8 md:p-12 mb-16 relative bg-background animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-black text-foreground">New Delivery Address</h2>
                        <button
                            onClick={() => setShowForm(false)}
                            className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 text-red-600 dark:text-red-400 text-xs py-3 px-4 rounded-md mb-8 flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="input-clean w-full bg-secondary/30"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="input-clean w-full bg-secondary/30"
                                    placeholder="10-digit mobile number"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Street Address *</label>
                                <input
                                    type="text"
                                    name="addressLine1"
                                    value={formData.addressLine1}
                                    onChange={handleChange}
                                    className="input-clean w-full bg-secondary/30"
                                    placeholder="House/Flat No., Building Name, Street"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Area / Colony</label>
                                <input
                                    type="text"
                                    name="addressLine2"
                                    value={formData.addressLine2}
                                    onChange={handleChange}
                                    className="input-clean w-full bg-secondary/30"
                                    placeholder="Area, Colony (Optional)"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="input-clean w-full bg-secondary/30"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">State *</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="input-clean w-full bg-secondary/30"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">PIN Code *</label>
                                <input
                                    type="text"
                                    name="pinCode"
                                    value={formData.pinCode}
                                    onChange={handleChange}
                                    className="input-clean w-full bg-secondary/30"
                                    placeholder="6-digit PIN"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Landmark</label>
                                <input
                                    type="text"
                                    name="landmark"
                                    value={formData.landmark}
                                    onChange={handleChange}
                                    className="input-clean w-full bg-secondary/30"
                                    placeholder="Nearby landmark (Optional)"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Address Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="input-clean w-full bg-secondary/30 appearance-none"
                                >
                                    <option value="home">Home (All day delivery)</option>
                                    <option value="work">Work (Deliver between 10am - 5pm)</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                            <input
                                type="checkbox"
                                id="isDefault"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                                className="w-4 h-4 rounded text-primary border-border focus:ring-primary h-4 w-4"
                            />
                            <label htmlFor="isDefault" className="text-sm font-semibold text-foreground cursor-pointer">
                                Set as default delivery address
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-clean btn-primary-clean w-full h-14 text-base font-bold shadow-lg shadow-primary/10 mt-6"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                                'Save and Continue'
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Addresses List - Mathematical Alignment */}
            {isLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="card-minimal p-8 animate-pulse">
                            <div className="skeleton h-6 w-1/2 mb-4" />
                            <div className="skeleton h-4 w-full mb-2" />
                            <div className="skeleton h-4 w-3/4" />
                        </div>
                    ))}
                </div>
            ) : addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-secondary/10 rounded-2xl border-2 border-dashed border-border">
                    <div className="w-20 h-20 bg-background rounded-full border border-border flex items-center justify-center mb-8 text-muted-foreground/30">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-foreground">No saved addresses</h2>
                    <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Add a delivery address to complete your checkout process faster.</p>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="btn-clean btn-primary-clean h-12 px-8 mt-10"
                        >
                            Add New Address
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid-standard">
                    {addresses.map((address) => (
                        <div key={address.id} className="card-minimal p-8 bg-background flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between gap-4 mb-6">
                                    <span className="text-xs font-black text-accent uppercase tracking-widest">{address.type}</span>
                                    {address.isDefault && (
                                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-md">Default</span>
                                    )}
                                </div>

                                <h3 className="text-xl font-black text-foreground mb-4">{address.fullName}</h3>

                                <div className="space-y-1 text-sm text-muted-foreground mb-6 font-medium">
                                    <p>{address.addressLine1}</p>
                                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                                    <p>{address.city}, {address.state} - {address.pinCode}</p>
                                    {address.landmark && (
                                        <p className="text-xs text-muted-foreground/60 italic mt-2">Landmark: {address.landmark}</p>
                                    )}
                                    <p className="pt-4 text-foreground font-bold">Phone: {address.phoneNumber}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-border mt-auto">
                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className="text-xs font-bold text-muted-foreground hover:text-accent transition-colors"
                                    >
                                        Set as Default
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(address.id)}
                                    className="text-xs font-bold text-muted-foreground hover:text-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
